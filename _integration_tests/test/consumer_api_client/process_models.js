'use strict';

const should = require('should');

const testSetup = require('../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   GET  ->  /process_models', function() {

  let httpBootstrapper;
  let consumerApiClientService;
  
  this.timeout(testTimeoutMilliseconds);

  before(async () => {
    httpBootstrapper = await testSetup.initializeBootstrapper();
    await httpBootstrapper.start();

    consumerApiClientService = await testSetup.resolveAsync('ConsumerApiClientService');
  });
  
  afterEach(async () => {
    await httpBootstrapper.reset();
  });

  after(async () => {
    await httpBootstrapper.shutdown();
  });

  it('should return process models through the consumer api', async () => {
    
    const processModelList = await consumerApiClientService.getProcessModels();

    should(processModelList).have.property('process_models');

    should(processModelList.process_models).be.instanceOf(Array);
    should(processModelList.process_models.length).be.greaterThan(0);

    processModelList.process_models.forEach((processModel) => {
      should(processModel).have.property('key');
      should(processModel).have.property('startEvents');
      should(processModel.startEvents).be.instanceOf(Array);
    });
  });

  it.skip('should fail the retrieve a list of process models, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail the retrieve a list of process models, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
