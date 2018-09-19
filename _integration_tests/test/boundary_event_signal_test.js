'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Signal Boundary Event - ', () => {

  let testFixtureProvider;

  const processModelId = 'boundary_event_signal_test';
  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the running service task when a signal arrives', async () => {

    const expectedResult = /signal received/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result.tokenPayload).be.match(expectedResult);
  });
});
