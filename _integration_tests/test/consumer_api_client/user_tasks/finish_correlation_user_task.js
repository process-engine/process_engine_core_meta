'use strict';

const should = require('should');

const returnOnOptions = require('@process-engine/consumer_api_contracts').ProcessStartReturnOnOptions;

const testSetup = require('../../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   POST  ->  /process_models/:process_model_key/correlations/:correlation_id/user_tasks/:user_task_id/finish', function() {

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

  it('should successfully finish the given user task.', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_user_task_finish';
    const correlationId = 'correlationId';
    const userTaskId = 'userTaskId';
    const userTaskResult = {};
    
    await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to finish the user task, if the given process_model_key does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'invalidProcessModelKey';
    const correlationId = 'correlationId';
    const userTaskId = 'userTaskId';
    const userTaskResult = {};

    try {
      await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /process model key not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to finish the user task, if the given correlation_id does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_user_task_finish';
    const correlationId = 'invalidcorrelation';
    const userTaskId = 'userTaskId';
    const userTaskResult = {};

    try {
      await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /process model key not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to finish the user task, if the given user_task_id does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_user_task_finish';
    const correlationId = 'correlationId';
    const userTaskId = 'invalidUserTaskId';
    const userTaskResult = {};

    try {
      await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /user task id not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to finish the user task, if the given payload is invalid', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_user_task_finish';
    const correlationId = 'correlationId';
    const userTaskId = 'userTaskId';
    const userTaskResult = {};

    try {
      await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 400;
      const expectedErrorMessage = /invalid arguments/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  // TODO: Find a way to simulate a process error
  it.skip('should fail, if attempting to finish the user task caused an error', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_user_task_finish';
    const correlationId = 'correlationId';
    const userTaskId = 'invalidUserTaskId';
    const userTaskResult = {};

    try {
      await consumerApiClientService.finishUserTaskInCorrelation(processModelKey, correlationId, userTaskId, userTaskResult);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 500;
      const expectedErrorMessage = /could not be finished/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail finish the user task, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail finish the user task, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
