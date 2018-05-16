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
    'boundary_event_message_test',
    'boundary_event_signal_test',
    'boundary_event_error_test',
    'boundary_event_timer_test',
    'intermediate_event_message_test',
    'intermediate_event_signal_test',
    'generic_sample',
    'parallel_gateway_test',
    'script_task_test',
    'service_task_test',
    'subprocess_test',
    'terminate_end_event_sample',
    'xor_gateway_base_test',
    'xor_gateway_nested',
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
