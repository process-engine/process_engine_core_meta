'use strict';

const should = require('should');

const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Call activity tests', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute the process, which was specified in the call activity.', async () => {
    const processKey = 'call_activity_base_test';

    const expectedToken = {
      current: 3,
      history: {
        StartEvent_1: {},
        Task1: 1,
        CallActivity1: 2,
        Task2: 3,
      },
    };

    const result = await testFixtureProvider.executeProcess(processKey);

    // Test, if the token result exists and is an object
    should(result).not.be.undefined();
    should(result).be.Object();

    // Compare the resulting token with the expecting token.
    result.should.be.eql(expectedToken);
  });
});
