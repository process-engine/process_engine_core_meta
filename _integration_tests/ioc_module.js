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
    'error_boundary_event_test',
    'generic_sample',
    'parallel_gateway_test',
    'error_boundary_event_test',
    'terminate_end_event_sample',
    'simple_xor_gateway_test',
    'xor_evaluate_script_result',
    'nested_xor',
    'basic_service_task_tests',
    'service_task_exception_test',
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
