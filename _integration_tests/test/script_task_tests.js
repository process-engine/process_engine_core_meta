'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Tasks - ', () => {
  let testFixtureProvider;

  const processModelKey = 'script_task_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFiles = ['script_task_test.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFiles);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute different script tasks that access the token history and return different values', async () => {

    const initialToken = {
      test_type: 'basic_test',
    };

    const expectedResult = {
      prop1: 1337,
      prop2: 'Hello',
    };

    const result = await testFixtureProvider.executeProcess(processModelKey, initialToken);

    should(result).be.eql(expectedResult);
  });

  it('should throw an error when trying to execute a faulty script task', async () => {

    const initialToken = {
      test_type: 'faulty_task',
    };

    const expectedMessage = /a.*?not.*?defined/i;

    await testFixtureProvider.executeProcess(processModelKey, initialToken)
      .should.be.rejectedWith(expectedMessage);
  });
});
