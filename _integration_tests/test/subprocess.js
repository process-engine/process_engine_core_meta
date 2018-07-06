'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('SubProcess', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = ['subprocess_test.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute SubProcess and update token.', async () => {

    const processKey = 'SubProcess_test';
    const result = await testFixtureProvider.executeProcess(processKey);
    const expectedResult = {
      secondTest: '123456',
    };

    should(result)
      .eql(expectedResult);
  });

});
