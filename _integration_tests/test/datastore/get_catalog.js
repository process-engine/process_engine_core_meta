'use strict';

const should = require('should');
const request = require('supertest');

const HttpBootstrapper = require('@essential-projects/http_integration_testing').HttpIntegrationTestBootstrapper;
const getBootstrapper = require('../../application/get_bootstrapper');

const testTimeoutMilliseconds = 5000;

describe('Datastore:   GET  ->  /datastore', function() {
  let httpBootstrapper;
  
  this.timeout(describeTimeoutMS);
  
  before(async () => {
    httpBootstrapper = await getBootstrapper();
    await httpBootstrapper.start();
  });
  
  afterEach(async () => {
    await httpBootstrapper.reset();
  });

  after(async () => {
    await httpBootstrapper.shutdown();
  });

  it('should return catalog', async () => {
    const authToken = await httpBootstrapper.getTokenFromAuth('admin', 'admin');
    
    const response = await request(httpBootstrapper.app)
      .get(`/datastore`)
      .set('Authorization', 'bearer ' + authToken)
      .send();

    should(response.header['content-type']).equal('application/json; charset=utf-8');
    should(response.status).equal(200);
    should(response.body).not.be.undefined();
    should(response.body.catalog.classes).containEql('User');
  });

});
