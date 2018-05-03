'use strict';
const should = require('should');
const logger = require('loggerhythm');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Intermediate Catch Throw events test', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should catch a message that is thrown in a different process', async () => {
    const processKey = 'catch_message_test';
    const throwProcessKey = 'catch_throw_event_throw_message';

    // Expected Token for the catch process.
    const expectedCatchToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        CatchMessage1: 1,
        Task2: 2,
      },
    };

    // Expected Token for the throw process.
    const expectedThrowToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        ThrowMessage1: 1,
        Task2: 2,
      },
    };

    // Start the main process
    const catchEventResult = await testFixtureProvider.executeProcess(processKey);

    // Now start the process, that throws the message.
    const throwEventResult = await testFixtureProvider.executeProcess(throwProcessKey);

    // Check the token after the catch event finished.
    catchEventResult.should.be.equl(expectedCatchToken);

    // Check the token after the throw event finished.
    throwEventResult.should.be.eql(expectedThrowToken);
  })
    .timeout(5000);
});
