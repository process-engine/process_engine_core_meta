'use strict';

const should = require('should');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const testSetup = require('../../application/test_setup');

describe('Process-Engine   Parse BPMN Process into new object model', function () {
  let httpBootstrapper;
  this.timeout(5000);

  let sampleBpmnXmlCode;
  let bpmnModelParser;

  before(async () => {
    httpBootstrapper = await testSetup.initializeBootstrapper();
    sampleBpmnXmlCode = await testSetup.resolveAsync('parse_object_model_sample');
    bpmnModelParser = await testSetup.resolveAsync('BpmnModelParserService');
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

});
