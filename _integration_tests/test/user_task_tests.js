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

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const runningUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

    should(runningUserTasks).have.property('user_tasks');
    should(runningUserTasks.user_tasks).have.size(1);

    const currentRunningUserTaskKey = runningUserTasks.user_tasks[0].key;

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, currentRunningUserTaskKey, userTaskInput);

    // Give the back end some time to process the user task.
    await delayTest(delayTimeInMs);

    await assertUserTaskIsFinished(correlationId);
  });

  it('should execute two sequential user tasks', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (let current = 0; current < 2; current += 1) {
      const currentUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

      should(currentUserTasks).have.property('user_tasks');
      should(currentUserTasks.user_tasks).have.size(1, 'The process should have one waiting user task');

      const currentUserTaskKey = currentUserTasks.user_tasks[0].key;
      const userTaskResult = await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, currentUserTaskKey, userTaskInput);

      await delayTest(delayTimeInMs);
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
    await delayTest(delayTimeInMs);

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

    await delayTest(delayTimeInMs);
    await assertUserTaskIsFinished(correlationId);
  });

  it('should fail to execute a user task which is not in a waiting state', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      input_values: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

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
    await delayTest(delayTimeInMs);

    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);

    // If we try to finish the user task a second time, the promise should be rejected.
    const finishUserTaskPromise = testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);

    // TODO: The error message of the promise rejection should not be '403 - Access to process model forbidden'!
    // If this issue gets resolved, change this to expect the correct rejection message.
    // see https://github.com/process-engine/consumer_api_core/issues/21
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
  async function delayTest(timeInMilliseconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeInMilliseconds);
    });
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
   * Looks up in the datastore, if the user task of the process with the given is has a 'finish' state
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

    // Iterate over all user task that belongs to the process id and assert, that the state of every user task is 'end'
    for (const currentUserTask of userTaskPoJoData) {
      const currentUserTaskState = currentUserTask.state;
      should(currentUserTaskState).is.eql('end');
    }
  }
});
