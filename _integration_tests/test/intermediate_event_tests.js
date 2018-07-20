'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Intermediate Events - ', () => {

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

    const expectedResult = /message received/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

  it.skip('should throw and receive a signal', async () => {

    const processModelId = 'intermediate_event_signal_test';

    const expectedResult = /signal received/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

});
