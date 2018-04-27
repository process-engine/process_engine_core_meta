const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - Token split', async () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate the current token value correct and direct the token the right path', async () => {
    //ID of the process
    const processModelKey = 'xor_eval_script_result';

    //Expected Token Object
    const expectedResult = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        XORSplit1: 1,
        Task2: 2,
        XORJoin1: 2,
      }
    };

    //Execute the process
    const result = await testFixtureProvider.executeProcess(processModelKey);

    //Compare the Token
    result.should.be.eql(expectedResult);
  });
});
