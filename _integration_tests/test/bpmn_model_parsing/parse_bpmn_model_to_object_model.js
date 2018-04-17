'use strict';

const should = require('should');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const SequenceFlow = require('@process-engine/process_engine_contracts').Model.Types.SequenceFlow;
const FlowNode = require('@process-engine/process_engine_contracts').Model.Base.FlowNode;

const testSetup = require('../../application/test_setup');

describe('Process-Engine   Parse BPMN Process into new object model', function () {
  let httpBootstrapper;
  this.timeout(5000);

  const sampleProcessName = 'bs_payone_sample';

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

  it('Should successfully and correctly parse the BS Payone Sample BPMN into a ObjectModel structure', async() => {

    const result = await bpmnModelParser.parseXmlToObjectModel(sampleBpmnFile.bpmnXml);

    // Basic Definitions-Properties
    should.exist(result.xmlns);
    should.exist(result.collaboration);
    should(result.id).be.equal('Definitions_1');
    should(result.processes).be.an.instanceOf(Array);
    should(result.processes.length).be.equal(1);

    // Collaboration and Participants
    const collaboration = result.collaboration;

    should(collaboration.id).be.equal('Definitions_1');
    should(collaboration.participants).be.an.instanceOf(Array);
    should(collaboration.participants.length).be.equal(1);

    const participant = collaboration.participants[0];

    should(participant.id).be.equal('DemoProcess.Orchestration');
    should(participant.name).be.equal('Akka.NET - DemoProcess');
    should(participant.processReference).be.equal('TellProcess');

    // Process-Properties
    const process = result.processes[0];
    should(process.id).be.equal('TellProcess');
    should(process.name).be.equal('TellProcess');
    should(process.isExecutable).be.equal(true);
    should(process.flowNodes.length).be.equal(10);
    should(process.sequenceFlows.length).be.equal(10);

    process.flowNodes.forEach((item) => {
      should(item).be.an.instanceof(FlowNode);
    });

    process.sequenceFlows.forEach((item) => {
      should(item).be.an.instanceof(SequenceFlow);
    });
  })

});
