'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

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

    console.log(consumerContext);


    const correlationId = await testFixtureProvider.consumerApiService.startProcessInstance(consumerContext, processKey, 'StartEvent_1');

    console.log(correlationId);

  });
});
