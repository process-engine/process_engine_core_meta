'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Timer Boundary Event - ', () => {

  let testFixtureProvider;

  // Raise the timout for this test to 30 seconds.
  const testTimeout = 30000;

  // Every Test uses the same process model.
  const processKey = 'boundary_event_timer_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const bpmnProcessDefDirectory = 'bpmn';
    const processDefFileList = ['boundary_event_timer_test.bpmn'];

    await testFixtureProvider.loadProcessesFromBPMNFiles(bpmnProcessDefDirectory, processDefFileList);

  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt a service task after two seconds', async () => {

    // Initial token object
    const initialToken = {
      interrupt_task: true,
    };

    // Expected Token Object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        ITask1: 1,
        ITimerBoundary1: 1,
        ITask3: 2,
        IXORJoin1: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedToken);
  })
    .timeout(testTimeout);

  it.skip('should not interrupt a service task that finishes, before the timespan of the timer boundary event is over', async () => {

    // Initial token object
    const initialToken = {
      interrupt_task: false,
    };

    // Expected Token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        NITask1: 1,
        NITask2: 1,
        NITask3: 2,
        NIXORJoin1: 2,
        XORJoin1: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedToken);

  })
    .timeout(testTimeout);
});
