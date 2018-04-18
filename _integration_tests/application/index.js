'use strict';

const InvocationContainer = require('addict-ioc').InvocationContainer;
const logger = require('loggerhythm').Logger.createLogger('test:bootstrapper');
const path = require('path');

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
  '@process-engine/consumer_api_client',
  '@process-engine/consumer_api_core',
  '@process-engine/consumer_api_http',
  '@process-engine/process_engine',
  '@process-engine/process_engine_http',
  '@process-engine/process_repository',
  '.',
];

const iocModules = iocModuleNames.map((moduleName) => {
  return require(`${moduleName}/ioc_module`);
});

let container;

// NOTE: This startup script allows for the usage of the BPMN studio in conjunction with
// the integrationtest app, which enables us to edit the integrationtests' bpmn files without having 
// to import them manually.
async function start() {

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
    const bootstrapper = await container.resolveAsync('AppBootstrapper', [appPath]);

    logger.info('Bootstrapper started.');
  
    await bootstrapper.start();
  } catch (error) {
    logger.error('Failed to start bootstrapper!', error);
    throw error;
  }
}

start();
