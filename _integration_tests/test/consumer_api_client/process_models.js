'use strict';

const should = require('should');

const testSetup = require('../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe.only('Consumer API:   GET  ->  /process_models', function() {

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

    should(processModelList.header['content-type']).equal('application/json; charset=utf-8');
    should(processModelList.status).equal(200);
    should(processModelList.body).have.property('process_models');
    should(processModelList.body.process_models).be.instanceOf(Array);

    processModelList.body.process_models.forEach((processModel) => {
      should(processModel).have.property(key);
      should(processModel).have.property(startEvents);
      should(rprocessModel.startEvents).be.instanceOf(Array);
    });
  });

  it.skip('should fail the retrieve a list of process models, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail the retrieve a list of process models, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
