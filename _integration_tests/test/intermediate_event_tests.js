'use strict';
const should = require('should');
const logger = require('loggerhythm');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.skip('Intermediate Events - ', () => {

  let testFixtureProvider;

  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFileList = [
      'intermediate_event_message_test',
      'intermediate_event_signal_test',
    ];

    await testFixtureProvider.importProcessFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should throw and receive a message', async () => {

    const processModelId = 'intermediate_event_message_test';

    const expectedResult = {
      history: {
        StartEvent_1: {},
        Task1: 1,
        ParallelSplit1: 1,
        TimerEvent1: 1,
        CatchMessage1: 1,
        ThrowMessage1: 1,
        ParallelJoin1: 1,
        Task2: 2,
      },
    };

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.eql(expectedResult);
  });

  it('should throw and receive a signal', async () => {

    const processModelId = 'intermediate_event_signal_test';

    const expectedResult = {
      history: {
        StartEvent_1: {},
        Task1: 1,
        ParallelSplit1: 1,
        TimerEvent1: 1,
        CatchSignal1: 1,
        ThrowSignal1: 1,
        ParallelJoin1: 1,
        Task2: 2,
      },
    };

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.eql(expectedResult);
  });

});
