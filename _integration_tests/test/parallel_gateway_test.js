'use strict';

const should = require('should');
const setup = require('../application/test_setup');

const testTimeoutInMS = 5000;

describe('Parallel Gateway execution', function () {

  let httpBootstrapper;
  let processEngineService;
  let dummyExecutionContext;

  this.timeout(testTimeoutInMS);

  before(async () => {
    httpBootstrapper = await setup.initializeBootstrapper();
    await httpBootstrapper.start();
    dummyExecutionContext = await setup.createExecutionContext();
    processEngineService = await setup.resolveAsync('ProcessEngineService');
    await setup.importBPMNFromFile(dummyExecutionContext, `${__dirname}/parallel_gateway_test.bpmn`);
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

  // TODO: This test currently fails, because the parallel gateway does not behave as expected.
  // See Issue: https://github.com/process-engine/process_engine/issues/48
  it(`should successfully run two parallel tasks and contain the result of each task in the token history.`, async () => {
    const processKey = 'parallel_gateway';
    const initialToken = {};
    const result = await processEngineService.executeProcess(dummyExecutionContext, undefined, processKey, initialToken);

    const expectedHistoryEntryForTask1 = 'st_longTask';
    const expectedHistoryEntryForTask2 = 'st_veryLongTask';
    const expectedHistoryEntryForTask3 = 'st_secondVeryLongTask';
    const expectedTask1Result = 'longRunningFunction has finished';
    const expectedTask2Result = 'veryLongRunningFunction has finished';
    const expectedTask3Result = 'secondVeryLongRunningFunction has finished';

    const expectedHistoryEntryForTokenTestTask = 'st_currentTokenTestPart2';
    const expectedTokenTestTaskResult = 'current token test value';

    const expectedHistoryEntryForSequence3 = 'st_SequenceTestTask3';
    const expectedSequenceTestTaskResult = 'UPDATED Script Task result for sequence test';

    should(result).have.keys(
      expectedHistoryEntryForTask1,
      expectedHistoryEntryForTask2,
      expectedHistoryEntryForTask3,
      expectedHistoryEntryForTokenTestTask,
      expectedHistoryEntryForSequence3);
    should(result[expectedHistoryEntryForTask1]).be.equal(expectedTask1Result);
    should(result[expectedHistoryEntryForTask2]).be.equal(expectedTask2Result);
    should(result[expectedHistoryEntryForTask3]).be.equal(expectedTask3Result);
    should(result[expectedHistoryEntryForTokenTestTask]).be.equal(expectedTokenTestTaskResult);
    should(result[expectedHistoryEntryForSequence3]).be.equal(expectedSequenceTestTaskResult);
  });
});
