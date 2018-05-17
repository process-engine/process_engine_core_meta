'use strict';

const should = require('should');
const path = require('path');

const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Call activity tests', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = [
    //   'call_activity_base_test.bpmn',
    //   'call_activity_nested_process.bpmn',
    //   'call_activity_normal_process.bpmn',
    //   'call_activity_throw_exception.bpmn',
    //   'call_activity_throw_exception_test.bpmn',
    // ];

    // // Load all processes definitions that belongs to the test
    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the process, which was specified in the call activity', async () => {
    const processKey = 'call_activity_base_test';

    // Define the ingoing token object.
    const initialToken = {
      operation: 'basic_test',
    };

    // Expected token history.
    // WIP - DO. NOT. TOUCH. Or burn in hell.
    // const expectedHistoryResultToken = {
    //   current: {
    //     correlation_id: '6b0ff1a3-9533-4f25-b9d4-78c60d13b4c5',
    //   },
    //   history: {
    //     StartEvent_1: {
    //       operation: 'basic_test',
    //     },
    //     Task1: 1,
    //     ExclusiveGatewaySplit_92vrb290b1c: 1,
    //     CallActivity1: {
    //       correlation_id: '6b0ff1a3-9533-4f25-b9d4-78c60d13b4c5',
    //     },
    //     ExclusiveGatewayJoin_08v1crf3cvf1v19c: {
    //       correlation_id: '6b0ff1a3-9533-4f25-b9d4-78c60d13b4c5',
    //     },
    //   },
    // };

    // // Execute the process with the given token.
    // const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    // should(result).be.eql(expectedHistoryResultToken);
  });

  it.skip('should exectue a process which executes another process', async () => {
    const processKey = 'call_activity_base_test';

    // Define the ingoing token
    const initialToken = {
      operation: 'nested_test',
    };

    // Expected token object
    const expectedResultToken = {
      current: 6,
      history: {
        StartEvent1: initialToken,
        XORSplit1: initialToken,
        Task2: 2,
        CallActivity2: 5,
        FinalIncrement: 6,
      },
    };

    // Execute the process with the defined token
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedResultToken);
  });

  it.skip('should call an activity that throws an exception which will be catched inside the executed call activity itself', async () => {
    const processKey = 'call_activity_exception_test';

    // Define the ingoing token
    const initialToken = {
      handle_exception: true,
    };

    // Define the expected token object
    const expectedResultToken = {
      current: 2,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        CallActivity1: 1,
        Task1: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedResultToken);
  });

  it.skip('should call an activity that throws an unexpected exception which is catched it via a boundary event', async () => {
    const processKey = 'call_activity_exception_test';

    // Define the ingoing token
    const initialToken = {
      handle_exception: false,
    };

    // Define the expected token object
    const expectedResultToken = {
      current: 2,
      history: {
        StartEvent1: initialToken,
        XORSplit1: initialToken,
        CallActivity2: 1,
        Task2: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedResultToken);
  });
});
