'use strict';

const should = require('should');
const request = require('supertest');

const setup = require('../../application/test_setup');

const testTimeoutMilliseconds = 5000;

describe('Datastore:   GET  ->  /datastore', function() {
  let httpBootstrapper;
  
  this.timeout(testTimeoutMilliseconds);
  
  before(async () => {
    httpBootstrapper = await setup.initializeBootstrapper();
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
