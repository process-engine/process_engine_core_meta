'use strict';

const should = require('should');
const fixture = require('../application/dist/commonjs/process_engine_service_test_fixture')

const testTimeoutInMS = 5000;

describe('Parallel Gateway execution', function () {

  let processEngineServiceFixture;

  this.timeout(testTimeoutInMS);

  before(async () => {
    processEngineServiceFixture = new fixture.ProcessEngineServiceTestFixture(`${__dirname}/../application/bpmn/parallel_gateway_test.bpmn`);
    await processEngineServiceFixture.setup();
  });

  after(async () => {
    await processEngineServiceFixture.tearDown();
  });

  // TODO: This test currently fails, because the parallel gateway does not behave as expected.
  // See Issue: https://github.com/process-engine/process_engine/issues/48
  it(`should successfully run two parallel tasks and contain the result of each task in the token history.`, async () => {
    const processKey = 'parallel_gateway';
    const result = await processEngineServiceFixture.executeProcess(processKey);

    const expectedHistoryEntryForTask1 = 'st_longTask';
    const expectedHistoryEntryForTask2 = 'st_veryLongTask';
    const expectedHistoryEntryForTask3 = 'st_secondVeryLongTask';
    const expectedHistoryEntryForTokenTestTask = 'st_currentTokenTestPart2';
    const expectedHistoryEntryForSequence3 = 'st_SequenceTestTask3';

    should(result).have.keys(
      expectedHistoryEntryForTask1,
      expectedHistoryEntryForTask2,
      expectedHistoryEntryForTask3,
      expectedHistoryEntryForTokenTestTask,
      expectedHistoryEntryForSequence3);
    should(result[expectedHistoryEntryForTask1]).be.equal('longRunningFunction has finished');
    should(result[expectedHistoryEntryForTask2]).be.equal('veryLongRunningFunction has finished');
    should(result[expectedHistoryEntryForTask3]).be.equal('secondVeryLongRunningFunction has finished');
    should(result[expectedHistoryEntryForTokenTestTask]).be.equal('current token test value');
    should(result[expectedHistoryEntryForSequence3]).be.equal('UPDATED Script Task result for sequence test');
  });
});
