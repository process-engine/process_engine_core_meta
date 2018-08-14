'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

// TODO: There is currently no handler for the terminate end event, so these tests can never work.
// As soon as a handler exists, these tests need to be refactored to the new specs.
describe.skip('Terminate End Event', () => {

  let testFixtureProvider;

  const processModelId = 'terminate_end_event_sample';
  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should successfully terminate a process upon reaching a TerminateEndEvent.', async () => {

    // NOTE: We require the process instance ID for later assertions.
    try {
      await testFixtureProvider.executeProcess(processModelId, startEventId);
      should.fail(result, undefined, 'This should have caused an error!');
    } catch (error) {
      const expectedError = /process was terminated.*?TerminateEndEvent_1/i;

      // NOTE: This only shows the Blackbox Result of the test. To verify that the process- and all corresponding nodes
      // were actually terminated, we need to query the database.
      should(error.message).be.match(expectedError);
    }

  });
});
