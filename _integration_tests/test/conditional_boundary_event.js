'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Conditional Boundary Event', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const testProcessDefFileName = ['boundary_event_conditional.bpmn'];
    await testFixtureProvider.loadProcessesFromBPMNFiles(testProcessDefFileName);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it.skip('should return "lesser" if the initial token is lesser than or equal to four.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 4);

    should.exists(result);
    should(result.current).be.eql('lesser');
  });

  it.skip('should return "greater" if the initial token is greater than or equal to six.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 6);

    should.exists(result);
    should(result.current).be.eql('greater');
  });
});
