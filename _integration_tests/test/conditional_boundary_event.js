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

  it('should return "lesser" if the initial token is lesser or equal than four.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 4);

    should.exists(result);
    should(result.current).be.eql('lesser');
  });

  it('should return "greater" if the initial token is greater or equal than six.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 6);

    should.exists(result);
    should(result.current).be.eql('greater');
  });
});
