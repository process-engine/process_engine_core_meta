'use strict';

const Promise = require('bluebird');
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

const testTimeoutInMS = 5000;

const BpmnType = require('@process-engine/process_engine_contracts').BpmnType;

describe('SubProcess', function () {
  debugger;
  let testFixtureProvider;

  let nodeInstanceEntityTypeService;

  this.timeout(testTimeoutInMS);

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    nodeInstanceEntityTypeService = await testFixtureProvider.resolveAsync('NodeInstanceEntityTypeService');
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it(`should execute SubProcess and update token.`, async () => {

    const processKey = 'SubProcess_test';
    const result = await testFixtureProvider.executeProcess(processKey);
    const expectedResult = {
      secondTest: '123456'
    };

    should(result).eql(expectedResult);
  });

});
