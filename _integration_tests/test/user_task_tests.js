'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;
const startCallbackType = require('@process-engine/consumer_api_contracts').StartCallbackType;

describe('User Tasks - ', () => {
  let testFixtureProvider;
  let consumerContext;

  const processModelKey = 'user_task_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
    consumerContext = testFixtureProvider.consumerContext;

    const processDefinitionFiles = ['user_task_test.bpmn'];
    await testFixtureProvider.loadProcessesFromBPMNFiles(processDefinitionFiles);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the user task.', async () => {

    // Initial Token Object
    const initialToken = {
      input_values: {},
    };

    // Start the process
    const correlationId = await startProcessAndReturnCorrelationId(initialToken);

    // Obtain the running user tasks
    const runningUserTasks = await getRunningUserTasksForCorrelationId(correlationId);

    // The following test is necessary, since should().have.size() only outputs 'There is no type adaptor `forEach` for undefined',
    // if the user_task properties is not defined in the resulting object.
    should(runningUserTasks).have.property('user_tasks');
    should(runningUserTasks.user_tasks).have.size(1);

    // TODO: Assert that the user task object hast the property 'key'.
    const currentRunningUserTaskKey = runningUserTasks.user_tasks[0].key;

    // Result that the running user task should receive.
    const userTaskInput = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    // Result of the user task.
    const userTaskResult = await testFixtureProvider
      .consumerApiService
      .finishUserTask(consumerContext, processModelKey, correlationId, currentRunningUserTaskKey, userTaskInput);
  });

  /**
   * Start a process with the given process model key and return the resulting correlation id.
   * @param {TokenObject} initialToken Initial token value.
   */
  async function startProcessAndReturnCorrelationId(initialToken) {
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
  async function getRunningUserTasksForCorrelationId(correlationId) {
    const userTasks = await testFixtureProvider
      .consumerApiService
      .getUserTasksForCorrelation(consumerContext, correlationId);

    return userTasks;
  }
});
