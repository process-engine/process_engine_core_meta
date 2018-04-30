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

  it('should execute a script, that simply returns the value 1.', async () => {

    // Key of the process
    const processKey = 'simple_script_task_test';

    // Expected Token
    const expectedToken = {
      current: 1,
      history: {
        StartEvent_1: {},
        Task1: 1,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check the result
    result.should.be.eql(expectedToken);
  });

  it('should store the object in the token history, which is returned by a simple script task.', async () => {

    // Process key
    const processKey = 'script_returns_object_test';

    // Token object, which should be produced by the test
    const expectedToken = {
      current: {
        prop1: 1337,
        prop2: 'value',
      },

      history: {
        StartEvent_1: {},
        Task1: {
          prop1: 1337,
          prop2: 'value',
        },
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Comare the result
    result.should.be.eql(expectedToken);
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

  it('should read the current token value and increment it.', async () => {

    const processKey = 'script_task_current_token_test';

    // The expected token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the results
    result.should.be.eql(expectedToken);
  });

});
