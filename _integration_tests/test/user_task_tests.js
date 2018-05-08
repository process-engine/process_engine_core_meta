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

    const callbackType = startCallbackType.CallbackOnProcessInstanceCreated;

    const correlationId = await testFixtureProvider.consumerApiService.startProcessInstance(
      consumerContext, processKey, 'StartEvent_1', inputValues, callbackType);

    const userTask = await testFixtureProvider.consumerApiService.getUserTasksForCorrelation(consumerContext, correlationId.correlation_id);

    const userTaskResult = {
      form_fields: {
        Sample_Form_Field: 'Hello',
      },
    };

    console.log(userTask);

    const utres = await testFixtureProvider.consumerApiService.finishUserTask(consumerContext,
      processKey, correlationId.correlation_id, userTask.user_tasks[0].key, userTaskResult);

    console.log(utres);

  });
});
