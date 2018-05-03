'use strict';
const should = require('should');
const logger = require('loggerhythm');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Intermediate Catch Throw events test', () => {

  let testFixtureProvider;

  // Set the timeout to 2 seconds per test.
  const testTimeOut = 4000;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should throw and receive a message.', async () => {
    const processKey = 'catch_throw_event_message_base_test';

    // Expected token object after the test finished.
    const expectedToken = {
      current: 2,
      history: {
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

    // Check if the result exists.
    should(result).be.not.undefined();

    // Check, if the result is an object.
    should(result).be.Object();

    // Check if the result is not empty
    result.should.be.not.empty();

    // Compare the result with the expected token
    result.should.be.eql(expectedToken);
  })
    .timeout(testTimeOut);

  it('should throw and receive a message.', async () => {
    const processKey = 'catch_throw_event_signal_base_test';

    // Expected token object after the test finished.
    const expectedToken = {
      current: 2,
      history: {
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

    // Check if the result exists.
    should(result).be.not.undefined();

    // Check, if the result is an object.
    should(result).be.Object();

    // Check if the result is not empty
    result.should.be.not.empty();

    // Compare the result with the expected token
    result.should.be.eql(expectedToken);
  })
    .timeout(testTimeOut);

});
