'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.skip('Conditional Boundary Event - ', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    // TODO: The import is currently broken (existing processes are duplicated, not overwritten).
    // Until this is fixed, use the "classic" ioc registration
    //
    // const testProcessDefFileName = ['boundary_event_conditional.bpmn'];
    // await testFixtureProvider.loadProcessesFromBPMNFiles(testProcessDefFileName);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should return "lesser", if the initial token is lesser than or equal 4.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 4);

    should.exists(result);
    should(result.current).be.eql('lesser');
  });

  it('should return "greater", if the initial token is greater than or equal 6.', async () => {
    const processKey = 'boundary_event_conditional';

    const result = await testFixtureProvider.executeProcess(processKey, 6);

    should.exists(result);
    should(result.current).be.eql('greater');
  });
});
