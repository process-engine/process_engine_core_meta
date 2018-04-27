'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Task - Access token history', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should access the token history.', async () => {

    const processKey = 'script_task_access_token_history_test';

    // Expected token object after the execution
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: 4,
        Task3: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the results
    result.should.be.eql(expectedToken);
  });
});
