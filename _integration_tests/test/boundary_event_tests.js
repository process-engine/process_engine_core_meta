'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Boundary Event - ', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the running service task when a message arrives', async () => {
    const processKey = 'boundary_event_message_test';

    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
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

    // Compare the result objects
    should(result).be.eql(expectedToken);
  });

  it('should interrupt the running service task when a signal arrives', async () => {
    const processKey = 'boundary_event_signal_test';

    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
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

    // Compare the result objects
    should(result).be.eql(expectedToken);
  });
});
