'use strict';

const should = require('should');
const Logger = require('loggerhythm').Logger;

const logger = Logger.createLogger('test:bootstrapper');

const HttpService = require('@essential-projects/services').HttpService;
const IamService = require('@process-engine/iam').IAMService;

describe('IamService - EnsureHasClaim -> ', () => {

  let httpClient;
  let iamService;

  let testUserToken;

  before(async () => {
    httpClient = new HttpService();
    iamService = new IamService(httpClient);
    iamService.config = {
      claimPath: 'http://localhost:5000/claims/ensure',
    };

    await loginTestUser();
  });

  async function loginTestUser() {

    const authRoute = 'http://localhost:5000/connect/token';

    const requestHeaders = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const payload = {
      grant_type: 'password',
      client_id: 'iam_integration_test_client',
      client_secret: 'test',
      scope: 'test_resource',
      username: 'alice',
      password: 'Admin1234*',
    };

    try {
      const response = await httpClient.post(authRoute, payload, requestHeaders);
      testUserToken = response.result.access_token;
    } catch (error) {
      logger.error('Recevied an error from the identity server!');
      logger.error(error);
      throw error;
    }
  }

  it('Should succeed if the user has the given claim', async () => {

    const userIdentity = {
      token: testUserToken,
    };

    try {
      // Nothing will be returned upon success.
      await iamService.ensureHasClaim(userIdentity, 'test_claim');
    } catch (error) {
      should.fail(error, undefined, error);
    }
  });

  it('Should fail if the user does not provide an auth token', async () => {

    try {
      await iamService.ensureHasClaim(undefined, 'phone_number');
      should.fail(undefined, false, 'This request should have failed, since the user does not have the claim!');
    } catch (error) {
      should(error.message)
        .match(/no.*?identity/i);
    }
  });

  it('Should fail if the user does not provide a claim name', async () => {

    const userIdentity = {
      token: testUserToken,
    };

    try {
      await iamService.ensureHasClaim(userIdentity);
      should.fail(undefined, false, 'This request should have failed, since the user does not have the claim!');
    } catch (error) {
      should(error.message)
        .match(/no.*?claimname/i);
    }
  });

  it('Should fail if the user does not have the given claim', async () => {

    const userIdentity = {
      token: testUserToken,
    };

    try {
      await iamService.ensureHasClaim(userIdentity, 'some_claim_that_does_not_exist');
      should.fail(undefined, false, 'This request should have failed, since the user does not have the claim!');
    } catch (error) {
      should(error.name).be.equal('ForbiddenError');
    }
  });
});
