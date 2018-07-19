'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - ', async () => {

  let testFixtureProvider;

  const startEventId = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFileList = [
      'exclusive_gateway_base_test',
      'exclusive_gateway_nested',
    ];

    await testFixtureProvider.importProcessFiles(processDefFileList);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate the current token value correct and direct the token the right path', async () => {

    const processModelId = 'exclusive_gateway_base_test';

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

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.eql(expectedResult);
  });

  it('should direct the token to two nested exclusive gateways.', async () => {

    const processModelId = 'exclusive_gateway_nested';

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

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.eql(expectedToken);

  });
});
