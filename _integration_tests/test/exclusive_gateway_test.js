'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - ', async () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const processDefFileList = [
    //   'exclusive_gateway_base_test.bpmn',
    //   'exclusive_gateway_nested.bpmn',
    // ];

    // await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate the current token value correct and direct the token the right path', async () => {
    // ID of the process
    const processModelKey = 'exclusive_gateway_base_test';

    // Expected Token Object
    const expectedResult = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        XORSplit1: 1,
        Task2: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processModelKey);

    result.should.be.eql(expectedResult);
  });

  it('should direct the token to two nested xor gateways.', async () => {
    // ID of the process
    const processKey = 'exclusive_gateway_nested';

    // Expected Token Result
    const expectedToken = {
      current: 4,
      history: {
        StartEvent_1: {},
        Task1: 1,
        XORSplit1: 1,
        Task2: 2,
        XORSplit2: 2,
        Task4: 3,
        XORJoin2: 3,
        Task6: 4,
        XORJoin1: 4,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    result.should.be.eql(expectedToken);

  });
});
