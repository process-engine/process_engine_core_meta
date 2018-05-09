'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Conditional Boundary Event', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should return "lesser" if token is 4 or lesser.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 5);
    console.log(result);

    // Compare the result objects
    should(result.current).be.eql('lesser');
  });

  it('should return "greater" if token is 6 or greater.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 6);
    console.log(result);

    // Compare the result objects
    should(result.current).be.eql('greater');
  });
});
