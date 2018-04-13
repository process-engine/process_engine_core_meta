'use strict';

const should = require('should');
const setup = require('../application/test_setup');

describe('Error Boundary Event execution', function () {

  let httpBootstrapper;
  let processEngineService;
  let dummyExecutionContext;

  before(async () => {
    httpBootstrapper = await setup.initializeBootstrapper();
    await httpBootstrapper.start();
    dummyExecutionContext = await setup.createExecutionContext();
    processEngineService = await setup.resolveAsync('ProcessEngineService');
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

  it(`should successfully detect the error and contain the result in the token history.`, async () => {
    const processKey = 'test_error_boundary_event';

    const initialToken = {};
    const result = await processEngineService.executeProcess(dummyExecutionContext, undefined, processKey, initialToken);

    const expectedHistoryEntry = 'message';
    const expectedTaskResult = 'test';

    should(result).have.key(expectedHistoryEntry);
    should(result[expectedHistoryEntry]).be.equal(expectedTaskResult);
  });
});
