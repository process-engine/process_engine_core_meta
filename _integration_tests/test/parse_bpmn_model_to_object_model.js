'use strict';

const should = require('should');

const SequenceFlow = require('@process-engine/process_engine_contracts').Model.Types.SequenceFlow;
const FlowNode = require('@process-engine/process_engine_contracts').Model.Base.FlowNode;

const ProcessEngineServiceTestFixture = require('../dist/commonjs/process_engine_service_test_fixture').ProcessEngineServiceTestFixture;

const testTimeoutInMS = 5000;

describe('Process-Engine   Parse BPMN Process into new object model', function () {

  this.timeout(5000);

  let processEngineServiceFixture;
  let bpmnModelParser;

  this.timeout(testTimeoutInMS);

  before(async () => {
    processEngineServiceFixture = new ProcessEngineServiceTestFixture();
    await processEngineServiceFixture.setup();
    bpmnModelParser = await processEngineServiceFixture.resolveAsync('BpmnModelParser');
  });

  after(async () => {
    await processEngineServiceFixture.tearDown();
  });

  it('Should successfully and correctly parse the BS Payone Sample BPMN into a ObjectModel structure', async() => {

    const sampleProcessName = 'generic_sample';

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

    should(participant.id).be.equal('GenericSample');
    should(participant.name).be.equal('Generic Sample');
    should(participant.processReference).be.equal('generic_sample');

    // Process-Properties
    const process = result.processes[0];
    should(process.id).be.equal('generic_sample');
    should(process.name).be.equal('generic_sample');
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
