'use strict';

const fs = require('fs');
const path = require('path');

const ParallelGatewayTestService = require('./dist/commonjs').ParallelGatewayTestService;
const ServiceTaskTestService = require('./dist/commonjs/service_task_test_service').ServiceTaskTestService;
const ConsumerApiClientService = require('../../consumer_api_meta/consumer_api_contracts/dist/commonjs/iconsumer_api_service').ConsumerApiClientService;

const registerInContainer = (container) => {

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);
  container.register('ServiceTaskTestService', ServiceTaskTestService);
  container.register('ConsumerApiClientService', ConsumerApiClientService);

  // add processes for use with the integrationtests here
  const processes = [
    'boundary_event_error_test',
    'boundary_event_message_test',
    'boundary_event_signal_test',
    'boundary_event_timer_test',
    'call_activity_subprocess',
    'call_activity_subprocess_error',
    'call_activity_subprocess_nested',
    'call_activity_test',
    'call_activity_test_error',
    'boundary_event_conditional',
    'exclusive_gateway_base_test',
    'exclusive_gateway_nested',
    'generic_sample',
    'intermediate_event_message_test',
    'intermediate_event_signal_test',
    'parallel_gateway_test',
    'script_task_test',
    'service_task_test',
    'subprocess_test',
    'terminate_end_event_sample',
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
