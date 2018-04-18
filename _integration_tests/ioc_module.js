'use strict';

const fs = require('fs');
const path = require('path');

const ParallelGatewayTestService = require('./dist/commonjs').ParallelGatewayTestService;

const registerInContainer = (container) => {
  const processes = [
    'parallel_gateway_test',
    'error_boundary_event_test'
  ];

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);

  processes.map((processFilename) => registerProcess(processFilename, container));
};

const registerProcess = (processFilename, container) => {
  const processFilePath = path.join(__dirname, 'bpmn', `${processFilename}.bpmn`);
  const processFile = fs.readFileSync(processFilePath, 'utf8');
 
  return container.registerObject(processFilename, processFile)
    .setTag('bpmn_process', 'internal')
    .setTag('module', 'process_engine_meta')
    .setTag('path', processFilePath);
}

module.exports.registerInContainer = registerInContainer;
