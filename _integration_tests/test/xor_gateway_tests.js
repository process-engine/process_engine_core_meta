'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway', async () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate the current token value correct and direct the token the right path', async () => {
    // ID of the process
    const processModelKey = 'xor_gateway_base_test';

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

    // Compare the Token
    result.should.be.eql(expectedResult);
  });

  it('should direct the token to two nested xor gateways.', async () => {
    // ID of the process
    const processKey = 'xor_gateway_nested';

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

    // Compare the resulting token of the process with the expected token.
    result.should.be.eql(expectedToken);

  });
});
