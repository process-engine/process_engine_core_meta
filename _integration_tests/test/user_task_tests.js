'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;
const startCallbackType = require('@process-engine/consumer_api_contracts').StartCallbackType;

describe.only('User Tasks', () => {
  let testFixtureProvider;
  let consumerContext;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
    consumerContext = testFixtureProvider.consumerContext;
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the user task.', async () => {

    const processKey = 'user_tasks_base_test';

    const inputValues = {
      input_values: {},
    };

    // Start the process
    const correlationId = await startProcessAndReturnCorrelationId(processKey, inputValues);

    // Optain the running user tasks
    const runningUserTasks = await getRunningUserTasksForCorrelationId(correlationId);

    // Result that the running user task should receive.
    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    // Result of the user task.
    const userTaskResult = await testFixtureProvider.consumerApiService.finishUserTask(consumerContext,
      processKey, correlationId, runningUserTasks.user_tasks[0].key, userTaskInput);

    // Test, if the list of user tasks containt exactly one user task
    should(runningUserTasks.user_tasks.length).be.equal(1);

  });

  /**
   * Start a process with the given process model key and return the resulting correlation id.
   * @param {string} processModelKey Key of the process Model.
   * @param {InputValues} inputValues Initial token value.
   */
  async function startProcessAndReturnCorrelationId(processModelKey, inputValues) {
    const callbackType = startCallbackType.CallbackOnProcessInstanceCreated;
    const result = await testFixtureProvider
      .consumerApiService
      .startProcessInstance(consumerContext, processModelKey, 'StartEvent_1', inputValues, callbackType);

    return result.correlation_id;
  }

  /**
   * Returns all user tasks that are running with the given correlation id.
   * @param {Object} correlationId correlation id of the process
   */
  async function getRunningUserTasksForCorrelationId(correlationId) {
    const userTasks = await testFixtureProvider
      .consumerApiService
      .getUserTasksForCorrelation(consumerContext, correlationId);

    return userTasks;
  }
});
