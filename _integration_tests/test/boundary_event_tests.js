'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Boundary Event', () => {
  let testFixtureProvider;

  // Set the test timeout to 15 seconds.
  const testTimeout = 15000;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the running service task, when a message arrives.', async () => {
    const processKey = 'boundary_event_message_base_test';

    const expectedToken = {
      current: 2,
      history: {
        Task1: 1,
        ParallelSplit1: 1,
        TimerEvent1: 1,
        ThrowEvent1: 1,
        Task3: 1,
        MessageBoundaryEvent1: 1,
        Task4: 2,
        XORJoin1: 2,
        ParallelJoin1: 2,
      },
    };

    const result = await testFixtureProvider.executeProcess(processKey);

    // Check, if the result is not undefined
    should(result).not.be.undefined();

    // Check, if the result is an object
    should(result).be.Object();

    // Compare the result objects
    result.should.be.eql(expectedToken);
  });

  it('should interrupt the running service task, when a signal arrives.', async () => {
    const processKey = 'boundary_event_signal_base_test';

    const expectedToken = {
      current: 2,
      history: {
        Task1: 1,
        ParallelSplit1: 1,
        TimerEvent1: 1,
        ThrowEvent1: 1,
        Task3: 1,
        SignalBoundaryEvent1: 1,
        Task4: 2,
        XORJoin1: 2,
        ParallelJoin1: 2,
      },
    };

    const result = await testFixtureProvider.executeProcess(processKey);

    // Check, if the result is not undefined
    should(result).not.be.undefined();

    // Check, if the result is an object
    should(result).be.Object();

    // Compare the result objects
    result.should.be.eql(expectedToken);
  });
});
