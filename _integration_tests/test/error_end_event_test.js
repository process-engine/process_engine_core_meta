'use strict';
const should = require('should');
const TestFixtureProver = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Error End Event - ', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProver();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = ['error_end_event_test.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should thrown an error, when the error end event is reached', async () => {
    const processModelKey = 'error_end_event_test';

    const processInstancePromise = testFixtureProvider.executeProcess(processModelKey);
    
    // TODO: Since the behavior of the error end event is not fully
    // designed, the expected promise rejection message is unknown.
    const expectedErrorName = 'Expected Error';
    should(processInstancePromise).be.rejectedWith(expectedErrorName);
  });



});
