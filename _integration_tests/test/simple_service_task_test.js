'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Service Task - Simle Service Task', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should returns the value, which the test service provides.', async () => {

    const processKey = 'simple_service_task_test';

    // The exptected token object should looks like this
    const exptectedToken = {
      current: 1,
      history: {
        StartEvent_1: {},
        Task1: 1,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the results
    result.should.be.eql(exptectedToken);
  });
});
