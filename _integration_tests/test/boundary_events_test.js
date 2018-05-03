'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Boundary Events', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the execution of the task on the boundary events.', async () => {
    // TODO: Also implement a tests for the non interrupting boundary events.

    const mainProcessKey = 'boundary_event_test';
    const throwEventsProcessKey = 'boundary_event_throw_events';

    // Start the process that throws the events
    await testFixtureProvider.executeProcess(throwEventsProcessKey);

    // Start the main test process
    const result = await testFixtureProvider.executeProcess(mainProcessKey);

    console.log(result);

  });
});
