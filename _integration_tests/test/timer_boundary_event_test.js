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

  it('should interrupt a service task after two seconds and not interrupt a task service, that finishes before the timer was over.', async () => {
    const processKey = 'boundary_event_timer_test';

    // Expected Token Object
    const expectedToken = {
      current: 3,
      history: {
        StartEvent_1: {},
        Task1: 1,
        TimerBoundary1: 1,
        Task3: 2,
        XORJoin1: 2,
        Task4: 3,
        Task5: 3,
        XORJoin2: 3,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check the token, that was returned.
    should(result).be.eql(expectedToken);
  });
});
