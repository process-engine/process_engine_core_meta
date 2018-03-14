'use strict';

const should = require('should');

const testSetup = require('../../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   GET  ->  /process_models/:process_model_key/events', function() {

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

  it('should return a process model\'s events by its process_model_key through the consumer api', async () => {

    const processModelKey = 'test_get_events_for_process_model';
    
    const eventList = await consumerApiClientService.getEventsForProcessModel(processModelKey);

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
  it.skip('should fail to retrieve the process model\'s events, if the process_model_key does not exist', async () => {

    const invalidProcessModelKey = 'invalidProcessModelKey';
    
    try {
      const processModel = await consumerApiClientService.getEventsForProcessModel(invalidProcessModelKey);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail to retrieve the process model\'s events, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail to retrieve the process model\'s events, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
