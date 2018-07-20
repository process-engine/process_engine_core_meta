'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Message Boundary Event - ', () => {

  let testFixtureProvider;

  const processKey = 'boundary_event_message_test';
  const startEventKey = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processKey]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the running service task when a message arrives', async () => {

    const expectedResult = /message received/i;

    const result = await testFixtureProvider.executeProcess(processKey, startEventKey);

    should(result.tokenPayload).be.match(expectedResult);
  });
});
