'use strict';

const should = require('should');

const returnOnOptions = require('@process-engine/consumer_api_contracts').ProcessStartReturnOnOptions;

const testSetup = require('../../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   POST  ->  /process_models/:process_model_key/correlations/:correlation_id/events/:event_id/trigger', function() {

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

  it('should successfully trigger the given event.', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_trigger_event';
    const correlationId = 'correlationId';
    const eventId = 'test_event_to_trigger'
    const eventTriggerPayload = {};
    
    await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to trigger the event, if the given process_model_key does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'invalidProcessModelKey';
    const correlationId = 'correlationId';
    const eventId = 'test_event_to_trigger'
    const eventTriggerPayload = {};

    try {
      await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /process model key not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to trigger the event, if the given correlation_id does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_trigger_event';
    const correlationId = 'invalidcorrelation';
    const eventId = 'test_event_to_trigger'
    const eventTriggerPayload = {};

    try {
      await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /process model key not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to trigger the event, if the given event_id does not exist', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_trigger_event';
    const correlationId = 'correlationId';
    const invalidEventId = 'invalidEventId';
    const eventTriggerPayload = {};

    try {
      await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /user task id not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to trigger the event, if the given payload is invalid', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_trigger_event';
    const correlationId = 'correlationId';
    const eventId = 'test_event_to_trigger'
    const eventTriggerPayload = {};

    try {
      await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
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
  it.skip('should fail, if attempting to trigger the event caused an error', async () => {

    // TODO: Replace with real values
    const processModelKey = 'test_consumer_api_trigger_event';
    const correlationId = 'correlationId';
    const eventId = 'invalideventId';
    const eventTriggerPayload = {};

    try {
      await consumerApiClientService.triggerEvent(processModelKey, correlationId, eventId, eventTriggerPayload);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 500;
      const expectedErrorMessage = /could not be finished/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail trigger the event, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail trigger the event, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
