'use strict';

const should = require('should');

const testSetup = require('../../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   GET  ->  /correlations/:correlation_id/events', function() {

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

  it('should return a correlation\'s events by its correlation_id through the consumer api', async () => {

    const correlationId = 'test_get_events_for_process_model';
    
    const eventList = await consumerApiClientService.getEventsForCorrelation(correlationId);

    should(eventList).have.property('events');

    should(eventList.events).be.instanceOf(Array);
    should(eventList.events.length).be.greaterThan(0);

    eventList.events.forEach((userTask) => {
      should(userTask).have.property('key');
      should(userTask).have.property('id');
      should(userTask).have.property('process_instance_id');
      should(userTask).have.property('data');
    });
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to retrieve the correlation\'s events, if the correlation_id does not exist', async () => {

    const invalidCorrelationId = 'invalidCorrelationId';
    
    try {
      const processModel = await consumerApiClientService.getEventsForCorrelation(invalidcorrelationId);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail to retrieve the correlation\'s events, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail to retrieve the correlation\'s events, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
