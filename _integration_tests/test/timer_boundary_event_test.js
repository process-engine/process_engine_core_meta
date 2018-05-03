'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Timer Boundary Event Tests', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt a service task after two seconds and not interrupt a task service, that finishes before the timer was over.', async () => {
    const processKey = 'timer_boundary_event_base_test';

    // Expected Token Object
    const expectedToken = {
      current: 3,
      history: {
        Task1: 1,
        TimerBoudary1: 1,
        Task2: 2,
        XORJoin1: 2,
        Task4: 2,
        Task5: 3,
        XORJoin2: 3,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check, if the resulting token is not undefined.
    should(result).not.be.undefined();

    // Check, if the resulting token is an object
    should(result).be.Object();

    // Check, if the resulting token is not empty
    result.should.not.be.empty();

    // Check the token, that was returned.
    result.should.be.eql(expectedToken);
  });
});
