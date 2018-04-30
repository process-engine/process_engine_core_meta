'use strict';

const fs = require('fs');
const path = require('path');

const ParallelGatewayTestService = require('./dist/commonjs').ParallelGatewayTestService;

const registerInContainer = (container) => {

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);

  // add processes for use with the integrationtests here
  const processes = [
    'error_boundary_event_test',
    'generic_sample',
    'nested_xor',
    'script_task_invalid_script',
    'parallel_gateway_test',
    'script_task_basic_test',
    'script_task_throws_exception',
    'simple_xor_gateway_test',
    'subprocess_test',
    'terminate_end_event_sample',
    'xor_evaluate_script_result',
  ];

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
