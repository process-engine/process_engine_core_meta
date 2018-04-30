'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Error Boundary Event execution', () => {

  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should successfully detect the error and contain the result in the token history.', async () => {
    const processKey = 'error_boundary_event_test';

    const result = await testFixtureProvider.executeProcess(processKey);

    const expectedTaskResult = 'test';

    should.exist(result);
    should(result.message).be.equal(expectedTaskResult);
  });
});
