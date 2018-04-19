'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

const testTimeoutInMS = 5000;

describe('Terminate End Event', function () {

  let testFixtureProvider;

  this.timeout(testTimeoutInMS);

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it(`should successfully terminate a process upon reaching a TerminateEndEvent.`, async () => {

    const processKey = 'terminate_end_event_sample';
    const result = await testFixtureProvider.executeProcess(processKey);

    const expectedResult = /terminated/i;

    // NOTE: This only shows the Blackbox Result of the test. To verify that the process- and all corresponding nodes 
    // were actually terminated, we need to query the database.
    should(result).match(expectedResult);
  });

  async function assertActiveNodeInstancesWereTerminated() {

  }

  async function assertPendingNodesWereNotCreated() {
    
  }
});
