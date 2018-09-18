'use strict';

const moment = require('moment');
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Start Events - ', () => {

  let testFixtureProvider;

  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFileList = [
      'start_event_timer_test',
    ];

    await testFixtureProvider.importProcessFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it.skip('should only start the process, after a message was received.', async () => {

    const processModelId = 'start_event_message_test';

    const expectedResult = /message received/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

  it.skip('should only start the process, after a signal was received', async () => {

    const processModelId = 'start_event_signal_test';

    const expectedResult = /signal received/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

  it('Should start the process after a delay of five seconds.', async () => {

    const processModelId = 'start_event_timer_test';

    const timeStampBeforeStart = moment();

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    const timeStampAfterFinish = moment();

    // Note that this is not exact,
    // since this time span equals the total process execution time and not just the duration of the timer.
    // This means that we can't perform an exact match here. We can only see, if the process execution was
    // delayed by at least the amount of time that the timer was supposed to last.
    const runtimeRaw = timeStampAfterFinish.diff(timeStampBeforeStart);
    const duration = moment
      .duration(runtimeRaw)
      .asSeconds();

    const expectedResult = /success/i;
    const expectedTimerRuntime = 5;

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
    should(duration).be.greaterThan(expectedTimerRuntime);
  });

});
