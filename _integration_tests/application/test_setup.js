'use strict';

const InvocationContainer = require('addict-ioc').InvocationContainer;
const _ = require('lodash');
const logger = require('loggerhythm').Logger.createLogger('test:bootstrapper');
const path = require('path');

const iocModuleNames = [
  '@essential-projects/services',
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
  
    process.env.CONFIG_PATH = path.resolve(__dirname, 'config');
    process.env.NODE_ENV = 'development';
    const appPath = path.resolve(__dirname);
    const bootstrapper = await container.resolveAsync('HttpIntegrationTestBootstrapper', [appPath]);
  
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

module.exports.createContext = async(role) => {
  const iamService = await container.resolveAsync('IamService');
  const roleToCreateContextFor = role || 'system';
  const context = await iamService.createInternalContext(roleToCreateContextFor);
  return context;
};

module.exports.getProcessById = async(processName) => {
  const processRepository = await container.resolveAsync('ProcessRepository');
  const processes = await processRepository.getProcessesByCategory('internal');

  const matchingProcess = _.find(processes, (process) => {
    return process.name === processName;
  });

  return matchingProcess;
};
