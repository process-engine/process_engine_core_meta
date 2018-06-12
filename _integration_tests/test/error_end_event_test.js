'use strict';
const should = require('should');
const TestFixtureProver = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.skip('Error End Event - ', () => {

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

  it('should throw an error, when the error end event is reached', async () => {
    const processModelKey = 'error_end_event_test';

    const processInstancePromise = testFixtureProvider.executeProcess(processModelKey);

    /*
     * TODO: Since the behavior of the ErrorEndEvent is not fully designed,
     * the object that is returned from a process that ends with an
     * ErrorEndEvent may vary.
     */
    const expectedErrorObject = {
      error_code: 'expected_error',
      name: 'Expected Error',
    };

    should(processInstancePromise).be.rejectedWith(expectedErrorObject);
  });

  it('should execute a call activity which ends with an error boundary event', async () => {
    const processModelKey = 'error_end_event_subprocess_call_activity_test';

    const initialToken = {
      test_scenario: 'call_activity',
    };

    const result = await testFixtureProvider.executeProcess(processModelKey, initialToken);

    should(result).have.property('current');
    should(result.current).be.equal(1);

    const expectedHistoryKeys = [
      'StartEvent_1',
      'XORSplit',
      'CallActivity1',
      'CAErrorBoundary1',
      'CATask1',
      'CAXorJoin1',
      'XORJoin'];

    should(result).have.property('history');
    should(result.history).have.keys(expectedHistoryKeys);
  });

  it('should execute a subprocess which ends with an error end event', async () => {
    const processModelKey = 'error_end_event_subprocess_call_activity_test';

    const initialToken = {
      test_scenario: 'sub_process',
    };

    const result = await testFixtureProvider.executeProcess(processModelKey, initialToken);

    should(result).have.property('current');
    should(result.current).be.equal(1);

    const expectedHistoryKeys = [
      'StartEvent_1',
      'XORSplit',
      'SubProcess1',
      'SPTask1',
      'SPXorJoin1',
      'XORJoin',
    ];

    should(result).have.property('history');
    should(result.history).have.keys(expectedHistoryKeys);
  });
});
