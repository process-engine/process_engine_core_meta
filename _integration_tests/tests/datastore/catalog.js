'use strict';

const should = require('should');
const request = require('supertest');

const HttpBootstrapper = require('@essential-projects/http_integration_testing').HttpIntegrationTestBootstrapper;
const getBootstrapper = require('../../application/get_bootstrapper');


describe('Datastore:   GET  ->  /datastore', function() {
  let httpBootstrapper;
  this.timeout(30000);
  
  before(async () => {
    httpBootstrapper = await getBootstrapper();
  });

  afterEach(async () => {
    await httpBootstrapper.reset();
  });

  it('should return catalog', async () => {
    await httpBootstrapper.start();

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
