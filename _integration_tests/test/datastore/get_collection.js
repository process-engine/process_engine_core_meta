'use strict';

const should = require('should');
const request = require('supertest');

const setup = require('../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Datastore:   GET  ->  /datastore/User', function() {
  let httpBootstrapper;
  
  this.timeout(testTimeoutMilliseconds);
  
  before(async () => {
    httpBootstrapper = await setup.initializeBootstrapper();
  });

  afterEach(async () => {
    await httpBootstrapper.reset();
  });
  
  after(async () => {
    await httpBootstrapper.shutdown();
  });

  it('should return collection', async () => {

    const userFixtures = [{
      name: 'Bob',
      password: '1',
      roles: ['system']
    }, {
      name: 'Alice',
      password: '2',
      roles: ['system']
    }];

    httpBootstrapper.addFixtures('User', userFixtures);

    await httpBootstrapper.start();
    
    const authToken = await httpBootstrapper.getTokenFromAuth('admin', 'admin');

    const response = await request(httpBootstrapper.app)
      .get(`/datastore/User`)
      .set('Authorization', 'bearer ' + authToken)
      .send();

    should(response.header['content-type']).equal('application/json; charset=utf-8');
    should(response.status).equal(200);
    should(response.body).not.be.undefined();
    
    for (const userFixture of userFixtures) {

      const foundUser = response.body.data.some((user) => {
        
        return user.name == userFixture.name
          && user.password != userFixture.password // the password must not be the one used in the fixture, but the hashed variant
          && user.roles[0] == userFixture.roles[0];
      });

      if (!foundUser) {
        throw new Error('data is missing');
      }
    }
  });

});
