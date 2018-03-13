'use strict';

const fs = require('fs');
const path = require('path');

const registerInContainer = (container) => {

  // TODO: Add processes for use in the integrationtests
  const processes = [
    'test_consumer_api_process_start'
  ];

  return processes.map((processFilename) => registerProcess(processFilename, container));
};

const registerProcess = (processFilename, container) => {
  const processFilePath = path.join(__dirname, 'bpmn', `${processFilename}.bpmn`);
  const processFile = fs.readFileSync(processFilePath, 'utf8');

  return container.registerObject(processFilename, processFile)
    .setTag('bpmn_process', 'internal')
    .setTag('module', 'process_engine_meta')
    .setTag('path', processFilePath);
};

module.exports.registerInContainer = registerInContainer;
