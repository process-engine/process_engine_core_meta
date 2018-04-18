'use strict';

const should = require('should');
const ProcessEngineServiceTestFixture = require('../dist/commonjs/process_engine_service_test_fixture').ProcessEngineServiceTestFixture;

const testTimeoutInMS = 5000;

describe.only('Terminate End Event', function () {

  let processEngineServiceFixture;

  this.timeout(testTimeoutInMS);

  before(async () => {
    processEngineServiceFixture = new ProcessEngineServiceTestFixture();
    await processEngineServiceFixture.setup();
  });

  after(async () => {
    await processEngineServiceFixture.tearDown();
  });

  it(`should successfully terminate a process upon reaching a TerminateEndEvent.`, async () => {

    const processKey = 'terminate_end_event_sample';
    const result = await processEngineServiceFixture.executeProcess(processKey);

    const expectedResult = /terminated/i;

    should(result).match(expectedResult);
  });
});
