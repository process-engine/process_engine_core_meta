'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Parallel Gateway execution', () => {

  let testFixtureProvider;

  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFileList = ['parallel_gateway_test'];
    await testFixtureProvider.importProcessFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should successfully run two parallel tasks and contain the result of each task in the token history.', async () => {

    const processModelId = 'parallel_gateway_test';
    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    const expectedHistoryEntryForTask1 = 'st_longTask';
    const expectedHistoryEntryForTask2 = 'st_veryLongTask';
    const expectedHistoryEntryForTask3 = 'st_secondVeryLongTask';
    const expectedHistoryEntryForTokenTestTask = 'st_currentTokenTestPart2';
    const expectedHistoryEntryForSequence3 = 'st_SequenceTestTask3';

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).have.keys(
      expectedHistoryEntryForTask1,
      expectedHistoryEntryForTask2,
      expectedHistoryEntryForTask3,
      expectedHistoryEntryForTokenTestTask,
      expectedHistoryEntryForSequence3);
    should(result.tokenPayload[expectedHistoryEntryForTask1]).be.equal('longRunningFunction has finished');
    should(result.tokenPayload[expectedHistoryEntryForTask2]).be.equal('veryLongRunningFunction has finished');
    should(result.tokenPayload[expectedHistoryEntryForTask3]).be.equal('secondVeryLongRunningFunction has finished');
    should(result.tokenPayload[expectedHistoryEntryForTokenTestTask]).be.equal('current token test value');
    should(result.tokenPayload[expectedHistoryEntryForSequence3]).be.equal('UPDATED Script Task result for sequence test');
  });
});
