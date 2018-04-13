'use strict';

const SampleService = require('./dist/commonjs').SampleService;

const registerInContainer = (container) => {
  return container.register('SampleService', SampleService);
};

module.exports.registerInContainer = registerInContainer;
