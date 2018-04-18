'use strict';

const fixture = require('../application/dist/commonjs/process_engine_service_test_fixture')
const should = require('should');

const testTimeoutInMS = 5000;

describe('Error Boundary Event execution', function () {

  let processEngineServiceFixture;

  this.timeout(testTimeoutInMS);

  before(async () => {
    processEngineServiceFixture = new fixture.ProcessEngineServiceTestFixture(`${__dirname}/../application/bpmn/error_boundary_event_test.bpmn`);
    await processEngineServiceFixture.setup();
  });

  after(async () => {
    await processEngineServiceFixture.tearDown();
  });

  it(`should successfully detect the error and contain the result in the token history.`, async () => {
    const processKey = 'error_boundary_event_test';

    const result = await processEngineServiceFixture.executeProcess(processKey);
    
    const expectedHistoryEntry = 'message';
    const expectedTaskResult = 'test';

    should(result).have.key(expectedHistoryEntry);
    should(result[expectedHistoryEntry]).be.equal(expectedTaskResult);
  });
});