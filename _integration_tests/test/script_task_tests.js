'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Task', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute a process with 4 chained script tasks.', async () => {

    // Key of the process
    const processKey = 'script_task_basic_test';

    // Expected Token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: 2,
        Task3: 3,
        Task4: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check the token object
    result.should.be.eql(expectedToken);
  });

});
