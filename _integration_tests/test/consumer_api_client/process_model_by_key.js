'use strict';

const should = require('should');

const testSetup = require('../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   GET  ->  /process_models/:process_model_key', function() {

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

  it('should return a process model by its process_model_key through the consumer api', async () => {

    // TODO: Replace with real values, once the mocks have been replaced.
    const processModelKey = 'processModelKey';
    
    const processModel = await consumerApiClientService.getProcessModelByKey(processModelKey);
    should(processModel).have.property('key');
    should(processModel).have.property('startEvents');
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to retrieve the process model, if the process_model_key does not exist', async () => {

    const invalidProcessModelKey = 'invalidProcessModelKey';
    
    try {
      const processModel = await consumerApiClientService.getProcessModelByKey(invalidProcessModelKey);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail to retrieve the process model, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail to retrieve the process model, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
