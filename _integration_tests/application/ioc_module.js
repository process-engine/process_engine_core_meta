'use strict';

const fs = require('fs');
const path = require('path');

const registerInContainer = (container) => {

  // add processes for use with the integrationtests here
  const processes = [
    'parse_object_model_sample'
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
