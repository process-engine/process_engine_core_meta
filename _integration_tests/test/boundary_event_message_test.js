'use strict';

const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.skip('Message Boundary Event - ', () => {

  let testFixtureProvider;

  const processKey = 'boundary_event_message_test';
  const startEventKey = 'StartEvent_1';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processKey]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the running service task when a message arrives', async () => {

    const expectedToken = {
      history: {
        StartEvent_1: {},
        Task1: 1,
        ParallelSplit1: 1,
        TimerEvent1: 1,
        ThrowEvent1: 1,
        Task3: 1,
        MessageBoundaryEvent1: 1,
        Task4: 2,
        XORJoin1: 2,
        ParallelJoin1: 2,
      },
    };

    const result = await testFixtureProvider.executeProcess(processKey, startEventKey);

    should(result.tokenPayload).be.eql(expectedToken);
  });
});
