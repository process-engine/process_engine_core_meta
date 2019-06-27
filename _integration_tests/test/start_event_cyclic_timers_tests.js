'use strict';

const moment = require('moment');
const should = require('should');
const uuid = require('node-uuid');

const {ProcessInstanceHandler, TestFixtureProvider} = require('../dist/commonjs');

describe('Start Events - ', () => {

  let cronjobService;
  let testFixtureProvider;
  let processInstanceHandler;

  const processModelId = 'start_events_with_cyclic_timers_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);

    //cronjobService = await testFixtureProvider.resolveAsync('CronjobService');
    processInstanceHandler = new ProcessInstanceHandler(testFixtureProvider);

    // await cronjobService.start();
  });

  after(async () => {
    // await cronjobService.stop();
    await testFixtureProvider.tearDown();
  });

  it('should be able to start a process with a cyclic TimerStartEvent event manually.', async () => {

    const messageStartEventId = 'TimerStartEvent_1';

    const result = await testFixtureProvider.executeProcess(processModelId, messageStartEventId);

    const expectedResult = /success/i;
    should(result).have.property('currentToken');
    should(result.currentToken).be.match(expectedResult);
  });
});
