'use strict';
const should = require('should');
const logger = require('loggerhythm');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Intermediate Catch Throw events test', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should throw and receive a message.', async () => {
    const processKey = 'intermediate_event_message_test';

    // Expected token object after the test finished.
    const expectedToken = {
      current: 2,
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

    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the result with the expected token
    should(result).be.eql(expectedToken);
  });

  it('should throw and receive a signal.', async () => {
    const processKey = 'intermediate_event_signal_test';

    // Expected token object after the test finished.
    const expectedToken = {
      current: 2,
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

    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the result with the expected token
    should(result).be.eql(expectedToken);
  });

});
