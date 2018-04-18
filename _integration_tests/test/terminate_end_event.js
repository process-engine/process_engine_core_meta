'use strict';

const should = require('should');
const setup = require('../application/test_setup');

describe.only('Terminate End Event', function () {

  let httpBootstrapper;
  let dummyContext;
  let processEngineService;
  this.timeout(5000);

  before(async () => {
    httpBootstrapper = await setup.initializeBootstrapper();
    dummyContext = await setup.createContext();
    processEngineService = await setup.resolveAsync('ProcessEngineService');
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

  it(`should successfully terminate a process upon reaching a TerminateEndEvent.`, async () => {

    const processKey = 'terminate_end_event_sample';
    const initialToken = {};
    const result = await processEngineService.executeProcess(dummyContext, undefined, processKey, initialToken);

    const expectedResult = /terminated/i;

    should(result).match(expectedResult);
  });
});
