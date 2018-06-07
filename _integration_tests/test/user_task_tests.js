'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;
const startCallbackType = require('@process-engine/consumer_api_contracts').StartCallbackType;

describe.only('User Tasks - ', () => {
  let testFixtureProvider;
  let consumerContext;

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
    await delayTest(500);

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
    await delayTest(500);

    await assertUserTaskIsFinished(correlationId);
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
    should(userTaskPoJoData).has.length(1, 'The number of user tasks with the given process id');

    const userTaskPoJo = userTaskPoJoData[0];
    const userTaskState = userTaskPoJo.state;
    should(userTaskState).be.eql('end');
  }
});
