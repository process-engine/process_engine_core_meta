'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

const testTimeoutInMS = 5000;

describe('Error Boundary Event - ', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = ['boundary_event_error_test.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should not alter the execution path, if the node instance, to which the event is attached, was executed successfully.', async () => {
    const processKey = 'boundary_event_error_test';

    const initialToken = {
      raiseError: false,
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    const expectedTaskResult = /success/i;

    should.exist(result);
    should(result).be.match(expectedTaskResult);
  });

  it('should successfully catch the error, alter the execution path and write the result to the token history.', async () => {
    const processKey = 'boundary_event_error_test';

    const initialToken = {
      raiseError: true,
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    const expectedTaskResult = /test/i;

    should.exist(result);
    should(result.message).be.match(expectedTaskResult);
  });
});
