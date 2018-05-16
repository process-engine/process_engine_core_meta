'use strict';

const Promise = require('bluebird');
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

const BpmnType = require('@process-engine/process_engine_contracts').BpmnType;

describe('SubProcess', () => {
  let testFixtureProvider;

  let nodeInstanceEntityTypeService;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const bpmnProcessDefDirectory = 'bpmn';
    const processDefFileList = ['subprocess_test.bpmn'];

    await testFixtureProvider.loadProcessesFromBPMNFiles(bpmnProcessDefDirectory, processDefFileList);
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
