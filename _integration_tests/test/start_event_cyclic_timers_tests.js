'use strict';

const should = require('should');

const {ProcessInstanceHandler, TestFixtureProvider} = require('../dist/commonjs');

describe('StartEvents with Cronjobs - ', () => {

  let cronjobService;
  let testFixtureProvider;
  let processInstanceHandler;

  const processModelId = 'start_events_with_cyclic_timers_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);

    cronjobService = await testFixtureProvider.resolveAsync('CronjobService');
    processInstanceHandler = new ProcessInstanceHandler(testFixtureProvider);
  });

  after(async () => {
    await testFixtureProvider
      .processModelUseCases
      .deleteProcessModel(testFixtureProvider.identities.defaultUser, processModelId);

    await testFixtureProvider.tearDown();
  });

  it('should automatically start a ProcessModel when a matching Cronjob expires', async () => {

    return new Promise(async (resolve, reject) => {
      const correlationId = `started_by_cronjob */2 * * * * *`;

      processInstanceHandler.waitForProcessInstanceToEnd(correlationId, processModelId, async() => {
        await cronjobService.stop();
        resolve();
      });

      await cronjobService.start();
    });
  });

  it('should be able to start a process with a cyclic TimerStartEvent event manually.', async () => {

    const messageStartEventId = 'TimerStartEvent_1';

    const result = await testFixtureProvider.executeProcess(processModelId, messageStartEventId);

    const expectedResult = /success/i;
    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);
  });
});
