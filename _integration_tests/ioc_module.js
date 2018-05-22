'use strict';

const fs = require('fs');
const path = require('path');

const ParallelGatewayTestService = require('./dist/commonjs').ParallelGatewayTestService;
const ServiceTaskTestService = require('./dist/commonjs/service_task_test_service').ServiceTaskTestService;

const registerInContainer = (container) => {

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);
  container.register('ServiceTaskTestService', ServiceTaskTestService);

  // add processes for use with the integrationtests here
  const processes = [
    'call_activity_subprocess',
    'call_activity_subprocess_error',
    'call_activity_subprocess_nested',
    'call_activity_test',
    'call_activity_test_error',
    'generic_sample',
  ];

  processes.map((processFilename) => {
    return registerProcess(processFilename, container);
  });
};

function registerProcess(processFilename, container) {
  const processFilePath = path.join(__dirname, 'bpmn', `${processFilename}.bpmn`);
  const processFile = fs.readFileSync(processFilePath, 'utf8');

  return container.registerObject(processFilename, processFile)
    .setTag('bpmn_process', 'internal')
    .setTag('module', 'process_engine_meta')
    .setTag('path', processFilePath);
}

module.exports.registerInContainer = registerInContainer;
