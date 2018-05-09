'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Timer Boundary Event - ', () => {

  let testFixtureProvider;

  // Every Test uses the same process model.
  const processKey = 'boundary_event_timer_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt a service task after two seconds', async () => {

    // Initial token object
    const initialToken = {
      interrupt_task: true,
    };

    // Expected Token Object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        ITask1: 1,
        ITimerBoundary1: 1,
        ITask2: 2,
        IXORJoin1: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    // Check the token, that was returned.
    should(result).be.eql(expectedToken);
  });

  it('should not interrupt a service task that finishes, before the timespan of the timer boundary event is over', async () => {

    // Initial token object
    const initialToken = {
      interrupt_task: false,
    };

    // Expected Token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        NITask1: 1,
        NITask2: 1,
        NITask3: 2,
        NIXORJoin1: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    // Check the returned token
    should(result).be.eql(expectedToken);

  });
});
