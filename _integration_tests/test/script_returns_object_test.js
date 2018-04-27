'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Task - Returns an object', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
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
});
