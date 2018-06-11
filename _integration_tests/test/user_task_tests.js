'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;
const startCallbackType = require('@process-engine/consumer_api_contracts').StartCallbackType;

describe('User Tasks - ', () => {
  let testFixtureProvider;
  let consumerContext;
  const delayTimeInMs = 500;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
    consumerContext = testFixtureProvider.consumerContext;

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefinitionFiles = ['user_task_test.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefinitionFiles);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the user task.', async () => {

    const processModelKey = 'user_task_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    const userTaskKey = 'user_task_1';

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    await finishUserTaskInCorrelation(correlationId, processModelKey, userTaskKey, userTaskInput);

    // Give the back end some time to finish the process.
    await wait(delayTimeInMs);

    await assertUserTaskIsFinished(correlationId);
  });

  it('should execute two sequential user tasks', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const userTaskKeys = [
      'User_Task_1',
      'User_Task_2',
    ];

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (const currentUserTaskKey of userTaskKeys) {
      await finishUserTaskInCorrelation(correlationId, processModelKey, currentUserTaskKey, userTaskInput);
    }

    await assertUserTaskIsFinished(correlationId);
  });

  it('should execute two parallel running user tasks', async () => {
    const processModelKey = 'user_task_parallel_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const currentRunningUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

    should(currentRunningUserTasks).have.property('user_tasks');
    should(currentRunningUserTasks.user_tasks).have.size(2, 'There should be two waiting user tasks');

    const waitingUsersTasks = currentRunningUserTasks.user_tasks;

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (const currentWaitingUserTask of waitingUsersTasks) {
      const currentWaitingUserTaskKey = currentWaitingUserTask.key;
      const currentUserTaskResult = testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, currentWaitingUserTaskKey, userTaskInput);
    }

    // Give the back end some time to some time to finish the process.
    await wait(delayTimeInMs);
    await assertUserTaskIsFinished(correlationId);
  });

  it('should fail to execute a user task which is not in a waiting state', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);
    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const expectedMessage = /.*UserTask*.User_Task_2.*not.*found/i;

    // Try to finish the user task which is currently not waiting
    const finishUserTaskPromise = testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_2', userTaskInput);

    should(finishUserTaskPromise).be.rejectedWith(expectedMessage);
  });

  it('should refuse to execute a user task twice', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const expectedMessage = /.*User_Task_1.*not.*found.*/i;

    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);

    const finishUserTaskPromise = testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);

    should(finishUserTaskPromise).be.rejected();
  });

  /**
   * Start a process with the given process model key and return the resulting correlation id.
   * @param {TokenObject} initialToken Initial token value.
   */
  async function startProcessAndReturnCorrelationId(processModelKey, initialToken) {
    const callbackType = startCallbackType.CallbackOnProcessInstanceCreated;
    const result = await testFixtureProvider
      .consumerApiService
      .startProcessInstance(consumerContext, processModelKey, 'StartEvent_1', initialToken, callbackType);

    return result.correlation_id;
  }

  /**
   * Returns all user tasks that are running with the given correlation id.
   * @param {Object} correlationId correlation id of the process
   */
  async function getWaitingUserTasksForCorrelationId(correlationId) {
    const userTasks = await testFixtureProvider
      .consumerApiService
      .getUserTasksForCorrelation(consumerContext, correlationId);

    return userTasks;
  }

  /**
   * Delays the test execution by the given amount of milliseconds.
   *
   * @param {number} timeInMilliseconds Delay time in milliseconds
   */
  async function wait(timeInMilliseconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeInMilliseconds);
    });
  }

  /**
   * Finishes a user task and returns the result of it.
   *
   * @param {string} correlationId Correlation id of the process instance with the user task
   * @param {string} processModelKey Model key of the process that contains the user task
   * @param {string} userTaskKey Identifier of the user task that should be finished
   * @param {object} userTaskInput Form input data for the user task
   * @returns Result of the finished user task
   */
  async function finishUserTaskInCorrelation(correlationId, processModelKey, userTaskKey, userTaskInput) {
    const waitingUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

    should(waitingUserTasks).have.property('user_tasks');
    should(waitingUserTasks.user_tasks).have.size(1, 'The process should have one waiting user task');

    const waitingUserTask = waitingUserTasks.user_tasks[0];

    should(waitingUserTask.key).be.equal(userTaskKey);

    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, waitingUserTask.key, userTaskInput);

    await wait(delayTimeInMs);

    return userTaskResult;
  }
  /**
   * Look up the processId for a given correlation Id and returns it.
   *
   * @param {string} correlationId correlation Id for the process id
   */
  async function getProcessIdForCorrelationId(correlationId) {

    const processEntityType = await testFixtureProvider
      .datastoreService
      .getEntityType('Process');

    const query = {
      query: {
        attribute: 'correlationId',
        operator: '=',
        value: correlationId,
      },
    };

    const process = await processEntityType.query(testFixtureProvider.context, query);
    const processPoJos = await process.toPojos(testFixtureProvider.context);
    should(processPoJos).have.property('data');

    const processPojoData = processPoJos.data;
    should(processPojoData).has.length(1, 'The list of returned processes for the correlation id');

    return processPojoData[0].id;
  }

  /**
   * Asserts that all user tasks for the given correlation have been finished.
   *
   * @param {string} correlationId Correlation id of the process
   */
  async function assertUserTaskIsFinished(correlationId) {
    const processId = await getProcessIdForCorrelationId(correlationId);

    const userTaskEntityType = await testFixtureProvider
      .datastoreService
      .getEntityType('UserTask');

    const query = {
      query: {
        attribute: 'process',
        operator: '=',
        value: processId,
      },
    };

    const userTasks = await userTaskEntityType.query(testFixtureProvider.context, query);
    const userTaskPoJos = await userTasks.toPojos(testFixtureProvider.context);
    const userTaskPoJoData = userTaskPoJos.data;
    should(userTaskPoJoData).not.be.empty('The list of the returned user tasks for a process should not be empty.');

    for (const currentUserTask of userTaskPoJoData) {
      const currentUserTaskState = currentUserTask.state;
      should(currentUserTaskState).is.eql('end');
    }
  }
});
