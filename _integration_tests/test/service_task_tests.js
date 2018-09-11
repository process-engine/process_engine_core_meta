'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe.only('Service Task - ', () => {

  let testFixtureProvider;

  const processModelId = 'service_task_test';
  const startEventId = 'StartEvent_1';
  const useAutoGeneratedCorrelationId = undefined;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    await testFixtureProvider.importProcessFiles([processModelId]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should sucessfully perform a series of service tasks that use a method invocation', async () => {

    const initialToken = {
      test_type: 'method_invocation',
    };

    const simpleObject = {
      prop1: 1337,
      prop2: 'Hello World',
    };

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.eql(simpleObject);
  });

  // TODO: This is not actually supported yet, but we need to ensure that using such an invocation will not cause the handler to crash.
  it('should sucessfully perform a service task that use a web service invocation', async () => {

    const initialToken = {
      test_type: 'webservice_invocation',
    };

    const expectedResult = /success/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

  // It is of course debatable, if such a thing should even be possible.
  // But in any case, this UseCase must not cause the ServiceTask handler to crash.
  // Any validation should be done by the succeeding tasks that might depend on this ServiceTask's result token.
  it('should not abort process model execution, if the service task has no invocation', async () => {

    const initialToken = {
      test_type: 'empty_invocation',
    };

    const expectedResult = /success/i;

    const result = await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);

    should(result).have.property('tokenPayload');
    should(result.tokenPayload).be.match(expectedResult);
  });

  it('should throw an error', async () => {

    const initialToken = {
      test_type: 'throw_exception',
    };

    const expectedErrorMessage = /failed/i;

    try {
      await testFixtureProvider.executeProcess(processModelId, startEventId, useAutoGeneratedCorrelationId, initialToken);
    } catch (error) {
      should(error.message).be.match(expectedErrorMessage);
    }
  });
});
