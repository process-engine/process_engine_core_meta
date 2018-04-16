'use strict';

const should = require('should');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;

const testSetup = require('../../application/test_setup');

describe.only('Process-Engine   Parse BPMN Process into new object model', function () {
  let httpBootstrapper;
  this.timeout(5000);

  const sampleProcessName = 'parse_object_model_sample';

  let sampleBpmnFile;
  let bpmnModelParser;

  before(async () => {
    httpBootstrapper = await testSetup.initializeBootstrapper();
    sampleBpmnFile = await testSetup.getProcessById(sampleProcessName);
    bpmnModelParser = await testSetup.resolveAsync('BpmnModelParser');
  });

  after(async () => {
    await httpBootstrapper.reset();
    await httpBootstrapper.shutdown();
  });

  it('Should successfully and correctly parse a BPMN diagram into an ObjectModel object', async() => {

    const inspectOptions = {
      showHidden: false,
      depth: 9,
      maxArrayLength: 100,
    };

    // TODO: Add assertions
    console.log(sampleBpmnFile);
    const parsingResult = await bpmnModelParser.parseXmlToObjectModel(sampleBpmnFile.bpmnXml);
    console.log(inspect(parsingResult, inspectOptions));
  })

});
