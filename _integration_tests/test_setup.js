'use strict';

const InvocationContainer = require('addict-ioc').InvocationContainer;
const _ = require('lodash');
const logger = require('loggerhythm').Logger.createLogger('test:bootstrapper');
const path = require('path');
const fs = require('fs');

const iocModuleNames = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/caching',
  '@essential-projects/core',
  '@essential-projects/data_model',
  '@essential-projects/data_model_contracts',
  '@essential-projects/datasource_adapter_base',
  '@essential-projects/datasource_adapter_postgres',
  '@essential-projects/datastore',
  '@essential-projects/datastore_http',
  '@essential-projects/datastore_messagebus',
  '@essential-projects/event_aggregator',
  '@essential-projects/feature',
  '@essential-projects/http_extension',
  '@essential-projects/http_integration_testing',
  '@essential-projects/iam',
  '@essential-projects/iam_http',
  '@essential-projects/invocation',
  '@essential-projects/messagebus',
  '@essential-projects/messagebus_http',
  '@essential-projects/messagebus_adapter_faye',
  '@essential-projects/metadata',
  '@essential-projects/pki_service',
  '@essential-projects/security_service',
  '@essential-projects/services',
  '@essential-projects/routing',
  '@essential-projects/timing',
  '@essential-projects/validation',
  '@process-engine/process_engine',
  '@process-engine/process_engine_http',
  '@process-engine/process_repository',
  '.',
];

const iocModules = iocModuleNames.map((moduleName) => {
  return require(`${moduleName}/ioc_module`);
});

let container;
let bootstrapper;

module.exports.initializeBootstrapper = async() => {

  try {
    container = new InvocationContainer({
      defaults: {
        conventionCalls: ['initialize'],
      },
    });

    for (const iocModule of iocModules) {
      iocModule.registerInContainer(container);
    }

    container.validateDependencies();

    const appPath = path.resolve(__dirname);
    bootstrapper = await container.resolveAsync('HttpIntegrationTestBootstrapper', [appPath]);

    const identityFixtures = [{
      // Default User, used to test happy paths
      name: 'testuser',
      password: 'testpass',
      roles: ['user'],
    },{
      // Restricted user without access rights to any lanes
      name: 'restrictedUser',
      password: 'testpass',
      roles: ['dummy'],
    },{
      // Used to test access rights to
      name: 'laneuser',
      password: 'testpass',
      roles: ['dummy'],
    }];

    bootstrapper.addFixtures('User', identityFixtures);

    logger.info('Bootstrapper started.');

    return bootstrapper;
  } catch (error) {
    logger.error('Failed to start bootstrapper!', error);
    throw error;
  }
}

module.exports.resolveAsync = async(moduleName) => {
  return container.resolveAsync(moduleName);
};

module.exports.createExecutionContext = async() => {
  const iamService = await container.resolveAsync('IamService');
  const context = await iamService.createInternalContext('system');
  return context;
};

module.exports.getProcessbyId = async(processName) => {
  const processRepository = await container.resolveAsync('ProcessRepository');
  const processes = await processRepository.getProcessesByCategory('internal');

  const matchingProcess = _.find(processes, (process) => {
    return process.name === processName;
  });

  return matchingProcess;
};
module.exports.importBPMNFromFile = async(executionContext, file) => {
  const processDefEntityTypeService = await container.resolveAsync('ProcessDefEntityTypeService');
  return processDefEntityTypeService.importBpmnFromFile(executionContext, {
    file: file,
  });
}
