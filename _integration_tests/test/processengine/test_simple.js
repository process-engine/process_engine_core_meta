'use strict';

const should = require('should');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const testSetup = require('../../application/test_setup');

describe('Process-Engine   POST  ->  /processengine/execute  test_simple', function () {
  let httpBootstrapper;
  this.timeout(5000);

  before(async () => {
    httpBootstrapper = await testSetup.initializeBootstrapper();
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

  it('execute test_simple process, should return true', async () => {

    // ---------------- create fixture for process definition -----------------
    const processDefFixtures = [{
      name: 'test_simple',
      key: 'test_simple',
      draft: true
    }];

    httpBootstrapper.addFixtures('ProcessDef', processDefFixtures);

    await httpBootstrapper.start();

    const authToken = await httpBootstrapper.getTokenFromAuth('admin', 'admin');

    // ---------------- query process definition to get id -----------------
    const responseQuery = await request(httpBootstrapper.app)
      .get('/datastore/ProcessDef?query={"attribute":"key","operator":"=","value": "test_simple"}')
      .set('Authorization', 'bearer ' + authToken)
      .send();

    should(responseQuery.header['content-type']).equal('application/json; charset=utf-8');
    should(responseQuery.status).equal(200);
    should(responseQuery.body).not.be.undefined();
    should(responseQuery.body.data.length).equal(1);

    const processDefId = responseQuery.body.data[0].id;

    // ---------------- read bpmn and update process definition -----------------
    const processDefPath = path.join(__dirname, 'test_simple.bpmn');
    const xml = fs.readFileSync(processDefPath, 'utf8');

    const responseUpdateBpmn = await request(httpBootstrapper.app)
      .post(`/datastore/ProcessDef/${processDefId}/updateBpmn`)
      .set('Authorization', 'bearer ' + authToken)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({xml: xml}));

    should(responseUpdateBpmn.status).equal(200);

    // ---------------- set process definition to latest published -----------------
    const responsePublish = await request(httpBootstrapper.app)
      .put(`/datastore/ProcessDef/${processDefId}`)
      .set('Authorization', `bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send('{"draft":false,"latest":true}')

    should(responsePublish.status).equal(200);

    // ---------------- finally execute process -----------------
    const responseExecute = await request(httpBootstrapper.app)
      .post(`/processengine/execute?id=${processDefId}`)
      .set('Authorization', 'bearer ' + authToken)
      .set('Content-Type', 'application/json')
      .send()

    should(responseExecute.status).equal(200);
    should(responseExecute.body).not.be.undefined();
    should(responseExecute.body).be.true; // this should test the last token of the process
  });

});
