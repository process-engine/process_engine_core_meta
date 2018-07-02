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
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    const userTaskKey = 'user_task_1';

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    await finishUserTaskInCorrelation(correlationId, processModelKey, userTaskKey, userTaskInput);

    // Give the back end some time to finish the process.
    await wait(delayTimeInMs);

    // TODO: to be meaningful, these assertions are blocked by
    //       https://github.com/process-engine/consumer_api_contracts/issues/26
    // await assertUserTaskIsFinished(correlationId);
  });

  it('should execute two sequential user tasks', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const userTaskKeys = [
      'User_Task_1',
      'User_Task_2',
    ];

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (const currentUserTaskKey of userTaskKeys) {
      await finishUserTaskInCorrelation(correlationId, processModelKey, currentUserTaskKey, userTaskInput);
    }

    // TODO: to be meaningful, these assertions are blocked by
    //       https://github.com/process-engine/consumer_api_contracts/issues/26
    // await assertUserTaskIsFinished(correlationId);
  });

  it('should execute two parallel running user tasks', async () => {
    const processModelKey = 'user_task_parallel_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const currentRunningUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

    should(currentRunningUserTasks).have.property('userTasks');
    should(currentRunningUserTasks.userTasks).have.size(2, 'There should be two waiting user tasks');

    const waitingUsersTasks = currentRunningUserTasks.userTasks;

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (const currentWaitingUserTask of waitingUsersTasks) {
      const currentWaitingUserTaskKey = currentWaitingUserTask.key;
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, currentWaitingUserTaskKey, userTaskInput);
    }

    // Give the back end some time to some time to finish the process.
    await wait(delayTimeInMs);
    // TODO: to be meaningful, these assertions are blocked by
    //       https://github.com/process-engine/consumer_api_contracts/issues/26
    // await assertUserTaskIsFinished(correlationId);
  });

  it('should fail to execute a user task which is not in a waiting state', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);
    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorName = /.*not.*found/i;
    const errorMessage = /.*User_Task_2.*/i;
    const errorCode = 404;

    try {
      // Try to finish the user task which is currently not waiting
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_2', userTaskInput);
    } catch (error) {
      should(error).has.properties('name', 'code', 'message');

      should(error.name)
        .match(errorName);

      should(error.code).be.equal(errorCode);

      should(error.message)
        .match(errorMessage);
    }
  });

  it('should refuse to execute a user task twice', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await wait(delayTimeInMs);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorName = /.*not.*found/i;
    const errorMessage = /.*User_Task_1.*/i;
    const errorCode = 404;

    await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);

    try {
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_1', userTaskInput);
    } catch (error) {
      should(error).has.properties('code', 'name', 'message');

      should(error.name)
        .match(errorName);

      should(error.code).be.equal(errorCode);

      should(error.message)
        .match(errorMessage);
    }
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

    return result.correlationId;
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

    should(waitingUserTasks).have.property('userTasks');
    should(waitingUserTasks.userTasks).have.size(1, 'The process should have one waiting user task');

    const waitingUserTask = waitingUserTasks.userTasks[0];

    should(waitingUserTask.key).be.equal(userTaskKey);

    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, waitingUserTask.key, userTaskInput);

    await wait(delayTimeInMs);

    return userTaskResult;
  }
});
