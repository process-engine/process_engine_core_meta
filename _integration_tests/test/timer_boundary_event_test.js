'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Timer Boundary Event Tests', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt a service task after two seconds.', async () => {
    const processKey = 'timer_boundary_event_base_test';

    const expectedTimeElapsedTask1 = 2;

    const expectedTimeElapsedTask2 = 2;

    const expectedKeysInHistory = ['Task1', 'TimerBoundary1', 'XORJoin1', 'Task3', 'Task4', 'Task5', 'TimerBoundary2', 'XORJoin2', 'Task6'];

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check, if the resulting token is not undefined.
    should(result).not.be.undefined();

    // Check, if the resulting token is not empty
    result.should.not.be.empty();

    // Check, if the result contains the right keys
    result.should.have.keys(expectedKeysInHistory);

    // Check, if the ellapsed time after the first service task is the expected.
    result.XORJoin1.should.be.equal(expectedTimeElapsedTask1);

    // Check, if the ellapsed time after the second service task ist the expected one.
    result.XORJoin2.should.be.equal(expectedTimeElapsedTask2);

  });
});
