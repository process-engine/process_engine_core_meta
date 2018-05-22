'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Boundary Event - ', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefList = [
    //   'boundary_event_message_test.bpmn',
    //   'boundary_event_signal_test.bpmn',
    // ];

    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it.skip('should interrupt the running service task when a message arrives', async () => {
    const processKey = 'boundary_event_message_test';

    const expectedToken = {
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

    should(result).be.eql(expectedToken);
  });

  it.skip('should interrupt the running service task when a signal arrives', async () => {
    const processKey = 'boundary_event_signal_test';

    const expectedToken = {
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

    should(result).be.eql(expectedToken);
  });
});
