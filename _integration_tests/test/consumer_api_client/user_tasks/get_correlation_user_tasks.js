'use strict';

const should = require('should');

const testSetup = require('../../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Consumer API:   GET  ->  /correlations/:correlation_id/user_tasks', function() {

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

  it('should return a correlation\'s user tasks by its correlation_id through the consumer api', async () => {

    const correlationId = 'test_consumer_api_process_start';
    
    const userTaskList = await consumerApiClientService.getUserTasksForCorrelation(correlationId);

    should(userTaskList).have.property('user_tasks');

    should(userTaskList.user_tasks).be.instanceOf(Array);
    should(userTaskList.user_tasks.length).be.greaterThan(0);

    userTaskList.user_tasks.forEach((userTask) => {
      should(userTask).have.property('key');
      should(userTask).have.property('id');
      should(userTask).have.property('process_instance_id');
      should(userTask).have.property('data');
    });
  });

  // TODO: Bad Path not implemented yet
  it.skip('should fail to retrieve the correlation\'s user tasks, if the correlation_id does not exist', async () => {

    const invalidCorrelationId = 'invalidCorrelationId';
    
    try {
      const processModel = await consumerApiClientService.getUserTasksForCorrelation(invalidcorrelationId);
      should.fail(result, undefined, 'This request should have failed!');
    } catch (error) {
      const expectedErrorCode = 404;
      const expectedErrorMessage = /not found/i
      should(error.code).match(expectedErrorCode);
      should(error.message).match(expectedErrorMessage);
    }
  });

  it.skip('should fail to retrieve the correlation\'s user tasks, when the user is unauthorized', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

  it.skip('should fail to retrieve the correlation\'s user tasks, when the user forbidden to retrieve it', async () => {
    // TODO: AuthChecks are currently not implemented.
  });

});
