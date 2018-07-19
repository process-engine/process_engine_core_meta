'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;
const startCallbackType = require('@process-engine/consumer_api_contracts').StartCallbackType;

describe('User Tasks - ', () => {

  let testFixtureProvider;

  let consumerContext;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
    consumerContext = testFixtureProvider.consumerContext;

    const processDefinitionFiles = [
      'user_task_test',
      'user_task_sequential_test',
      'user_task_parallel_test',
    ];
    await testFixtureProvider.importProcessFiles(processDefinitionFiles);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should finish the user task.', async () => {

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

    await finishUserTaskInCorrelation(correlationId, processModelKey, userTaskKey, userTaskInput);
  });

  it('should finish two sequential user tasks', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    await finishUserTaskInCorrelation(correlationId, processModelKey, 'User_Task_1', userTaskInput);
    await waitForProcessInstanceToReachUserTask(correlationId);
    await finishUserTaskInCorrelation(correlationId, processModelKey, 'User_Task_2', userTaskInput);
  });

  it('should finish two parallel running user tasks', async () => {
    const processModelKey = 'user_task_parallel_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

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
  });

  it('should fail to finish a user task which is not in a waiting state', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorObjectProperties = [
      'name',
      'code',
      'message',
    ];

    const errorName = /.*not.*found/i;
    const errorMessage = /.*User_Task_2.*/i;
    const errorCode = 404;

    try {
      // Try to finish the user task which is currently not waiting
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, 'User_Task_2', userTaskInput);
    } catch (error) {
      should(error).have.properties(...errorObjectProperties);

      should(error.name).be.match(errorName);
      should(error.code).be.equal(errorCode);
      should(error.message).be.match(errorMessage);
    }
  });

  it('should refuse to finish a user task twice', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorObjectProperties = [
      'name',
      'code',
      'message',
    ];

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
      should(error).have.properties(...errorObjectProperties);

      should(error.name).be.match(errorName);
      should(error.code).be.equal(errorCode);
      should(error.message).be.match(errorMessage);
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

    await waitForProcessInstanceToReachUserTask(result.correlationId);

    return result.correlationId;
  }

  /**
   * Periodically checks if a given correlation exists. After a max number of retries has been exceeded, an error is thrown.
   *
   * Background:
   * Since we must always resolve immediately after starting a process instance, it is possible that a process instance/correlation
   * does not yet exist, when we try to query it for user tasks. This can especially be an issue on slower machines.
   * To compensate this, we will periodically query the database for existing flow node instances for the given correlation.
   * When the first flow node instance other than the start event is found
   * (which is bound to be a user task, since the processes always start with those), we continue the tests.
   *
   * No assertions are made here, because that is the job of the tests.
   *
   * If the maximum number of retries has been exceeded, it is assumed that the process instance failed to start and throw an error.
   *
   * @param {string} correlationId The id of the correlation to wait for.
   */
  async function waitForProcessInstanceToReachUserTask(correlationId) {

    const maxNumberOfRetries = 10;
    const delayBetweenRetriesInMs = 500;

    const flowNodeInstanceService = await testFixtureProvider.resolveAsync('FlowNodeInstanceService');

    for (let i = 0; i < maxNumberOfRetries; i++) {

      await wait(delayBetweenRetriesInMs);

      const flowNodeInstances = await flowNodeInstanceService.querySuspendedByCorrelation(testFixtureProvider.executionContextFacade, correlationId);

      if (flowNodeInstances && flowNodeInstances.length >= 1) {
        return;
      }
    }

    throw new Error(`No process instance within correlation '${correlationId}' found! The process instance like failed to start!`);
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

    return userTaskResult;
  }

  async function wait(timeInMs) {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeInMs);
    });
  }
});
