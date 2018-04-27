const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - Conditional evaluation', () => {
  let testFixtureProvider;

  /**
   * Initialize the test.
   */
  before(async () => {
      testFixtureProvider = new TestFixtureProvider();
      await testFixtureProvider.initializeAndStart();
  })

  /**
   * Clean up after running the test
   */
  after(async () => {
    await testFixtureProvider.tearDown();
  })

  it('should return the correct value for the right path.', async () => {
      //The ID of the test process
      const processModelkey = 'simple_xor_gateway_test';

      //Content of the token, that should returned by the end of the process execution.
      const expectedToken = {
          'current': 1,
          'history': {
              'StartEvent_1': {},
              'XORSplit1': {},
              'Task1': 1,
              'XORJoin1': 1
          }
      };

      //Execute the process
      const result = await testFixtureProvider.executeProcess(processModelkey);

      //Compare the results
      result.should.be.eql(expectedToken);

  })
})
