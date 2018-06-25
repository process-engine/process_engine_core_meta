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
      correlationId: 'user_task_correlation_1',
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const runningUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

    should(runningUserTasks).have.property('userTasks');
    should(runningUserTasks.userTasks).have.size(1);

    const currentRunningUserTaskKey = runningUserTasks.userTasks[0].id;

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, currentRunningUserTaskKey, userTaskInput);

    await delayTest(delayTimeInMs);

    const correlationResults = await testFixtureProvider
      .consumerApiService
      .getAllProcessResultsForCorrelation(consumerContext, correlationId, processModelKey);

    should(correlationResults).have.size(1);
  });

  it('should execute two sequential user tasks', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const userTaskKeys = [
      'User_Task_1',
      'User_Task_2',
    ];

    for (const currentUserTaskKey of userTaskKeys) {
      const currentUserTasks = await getWaitingUserTasksForCorrelationId(correlationId);

      should(currentUserTasks).have.property('userTasks');
      should(currentUserTasks.userTasks).have.size(1, 'The process should have one waiting user task');

      const userTaskResult = await testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, currentUserTaskKey, userTaskInput);

      await delayTest(delayTimeInMs);
    }

    const correlationResults = await testFixtureProvider
      .consumerApiService
      .getAllProcessResultsForCorrelation(consumerContext, correlationId, processModelKey);

    should(correlationResults).have.size(1);

  });

  it('should execute two parallel running user tasks', async () => {
    const processModelKey = 'user_task_parallel_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

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
      const currentUserTaskResult = testFixtureProvider
        .consumerApiService
        .finishUserTask(consumerContext, processModelKey, correlationId, currentWaitingUserTaskKey, userTaskInput);
    }

    await delayTest(delayTimeInMs);

    const correlationResults = await testFixtureProvider
      .consumerApiService
      .getAllProcessResultsForCorrelation(consumerContext, correlationId, processModelKey);

    should(correlationResults).have.size(1);

  });

  it('should fail to execute a user task which is not in a waiting state', async () => {
    const processModelKey = 'user_task_sequential_test';

    const initialToken = {
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const userTaskInput = {
      formFields: {
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
      correlationId: 'user_task_correlation_1',
      inputValues: {},
    };

    const correlationId = await startProcessAndReturnCorrelationId(processModelKey, initialToken);

    // Allow for some time for the user task to be created and set to a waiting state.
    await delayTest(delayTimeInMs);

    const userTaskInput = {
      formFields: {
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
  async function startProcessAndReturnCorrelationId(processModelKey, startRequestPayload) {
    const callbackType = startCallbackType.CallbackOnProcessInstanceCreated;
    const result = await testFixtureProvider
      .consumerApiService
      .startProcessInstance(consumerContext, processModelKey, 'StartEvent_1', startRequestPayload, callbackType);

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
  async function delayTest(timeInMilliseconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeInMilliseconds);
    });
  }

});
