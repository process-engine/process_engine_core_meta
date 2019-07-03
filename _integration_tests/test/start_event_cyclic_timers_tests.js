'use strict';

const should = require('should');

const {ProcessInstanceHandler, TestFixtureProvider} = require('../dist/commonjs');

describe('StartEvents with Cronjobs - ', () => {

  let cronjobService;
  let testFixtureProvider;
  let processInstanceHandler;

  const processModelId = 'cyclic_timers_test';
  const processModelId2 = 'cyclic_timers_test_2';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);

    cronjobService = await testFixtureProvider.resolveAsync('CronjobService');
    processInstanceHandler = new ProcessInstanceHandler(testFixtureProvider);
  });

  after(async () => {
    await disposeProcessModel(processModelId);
    await disposeProcessModel(processModelId2);

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

  // Note that this should actually be handled by the Management API, which is not available in this setup.
  // So accessing the CronjobService manually is ok here.
  it('should be able to add crontabs from ProcessModels \'on the fly\'', async () => {

    return new Promise(async (resolve, reject) => {
      const correlationId = `started_by_cronjob */3 * * * * *`;

      processInstanceHandler.waitForProcessInstanceToEnd(correlationId, processModelId2, async() => {
        await cronjobService.stop();
        resolve();
      });

      await cronjobService.start();

      const parsedProcessModel2 = await getParsedProcessModel(processModelId2);

      await cronjobService.addOrUpdate(parsedProcessModel2);
    });
  });

  it('should be able to manually start a ProcessModel with a cyclic TimerStartEvent event.', async () => {

    const messageStartEventId = 'TimerStartEvent_1';

    const result = await testFixtureProvider.executeProcess(processModelId, messageStartEventId);

    const expectedResult = /success/i;
    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);
  });

  it('should not be able to automatically start a TimerStartEvent with misconfigured crontab.', async () => {

    const processModelMisconfiguredId = 'cyclic_timers_misconfigured_test';

    await testFixtureProvider.importProcessFiles([processModelMisconfiguredId]);
    await cronjobService.start();

    // The cronjob service won't throw errors when one or more crontab is invalid,
    // because that would prevent the valid crontabs from being used.
    // We can only assert that no cronjob was created for our invalid crontab.
    should(cronjobService.cronjobDictionary[processModelMisconfiguredId]).be.empty();

    await cronjobService.stop();
    await disposeProcessModel(processModelMisconfiguredId);
  });

  it('should not be able to automatically start a TimerStartEvent with invalid chars in the crontab.', async () => {

    const processModelInvalidId = 'cyclic_timers_invalid_chars_test';

    await testFixtureProvider.importProcessFiles([processModelInvalidId]);
    await cronjobService.start();

    // Same thing as above.
    should(cronjobService.cronjobDictionary[processModelInvalidId]).be.empty();

    await cronjobService.stop();
    await disposeProcessModel(processModelInvalidId);
  });

  async function disposeProcessModel(processModelId) {
    await testFixtureProvider
      .processModelUseCases
      .deleteProcessModel(testFixtureProvider.identities.defaultUser, processModelId);
  }

  async function getParsedProcessModel(processModelId) {
    await testFixtureProvider.importProcessFiles([processModelId]);

    return testFixtureProvider.processModelUseCases.getProcessModelById(testFixtureProvider.identities.defaultUser, processModelId);
  }
});
