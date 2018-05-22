'use strict';

const should = require('should');
const path = require('path');
const util = require('util');

const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Call activity tests', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = [
    //  'call_activity_subprocess.bpmn',
    //  'call_activity_subprocess_error.bpmn',
    //  'call_activity_subprocess_nested.bpmn',
    //  'call_activity_test.bpmn',
    //  'call_activity_test_error.bpmn',
    // ];

    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute a process which uses a call activity to increment a given token', async () => {
    const processKey = 'call_activity_test';

    const initialToken = {
      operation: 'basic_test',
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should.exist(result);
    should(result).have.property('history');
    should(result).have.property('current');
    should(result.history.Task1).be.eql(1, `Expected a value of 1 to be passed to the subprocess, but instead got ${result.history.Task1}`);
    should(result.current).be.eql(2, `Expected a subprocess result of 2, but instead got ${result.current}`);
  });

  it('should execute a process which uses two nested call activities to increment a given token', async () => {
    const processKey = 'call_activity_test';

    const initialToken = {
      operation: 'nested_test',
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should.exist(result);
    should(result).have.property('history');
    should(result).have.property('current');
    should(result.history.Task1).be.eql(1, `Expected a value of 1 to be passed to the nested subprocess, but instead got ${result.history.Task1}`);
    should(result.current).be.eql(3, `Expected a subprocess result of 3, but instead got ${result.current}`);
  });

  it('should call an erroneous call activity, whose error will be handled by the call activity itself', async () => {
    const processKey = 'call_activity_test_error';

    const initialToken = {
      handle_exception: true,
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should.exist(result);
    should(result).have.property('current');
    should(result.current).be.match(/error caught by subprocess/i);
  });

  it('should call an erroneous call actvity, whose error will be handled by a boundary event in the calling process', async () => {
    const processKey = 'call_activity_test_error';

    const initialToken = {
      handle_exception: false,
    };

    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should.exist(result);
    should(result).have.property('current');
    should(result.current).be.match(/error caught by main process/i);
  });
});
