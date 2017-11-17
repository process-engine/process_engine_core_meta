'use strict';

const should = require('should');
const request = require('supertest');

const HttpBootstrapper = require('@essential-projects/http_integration_testing').HttpIntegrationTestBootstrapper;
const getBootstrapper = require('../../application/get_bootstrapper');


describe('Datastore:   GET  ->  /datastore/User', function() {
  let httpBootstrapper;
  this.timeout(30000);
  
  before(async () => {
    httpBootstrapper = await getBootstrapper();
  });

  afterEach(async () => {
    await httpBootstrapper.reset();
  });

  it('should return catalog', async () => {

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

      const found = response.body.data.some((user) => {
        
        return user.name == userFixture.name
          && user.password != userFixture.password
          && user.roles[0] == userFixture.roles[0];
      });

      if (!found) {
        throw new Error('data is missing');
      }
    }
  });

});
