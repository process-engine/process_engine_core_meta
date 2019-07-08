'use strict';

const InvocationContainer = require('addict-ioc').InvocationContainer;
const Bluebird = require('bluebird');
const logger = require('loggerhythm').Logger.createLogger('test:bootstrapper');
const path = require('path');

Bluebird.config({
  cancellation: true,
});

global.Promise = Bluebird;

const iocModuleNames = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/event_aggregator',
  '@essential-projects/http_extension',
  '@essential-projects/services',
  '@essential-projects/sequelize_connection_manager',
  '@essential-projects/timing',
  '@process-engine/consumer_api_core',
  '@process-engine/correlation.service',
  '@process-engine/correlations.repository.sequelize',
  '@process-engine/cronjob_history.service',
  '@process-engine/cronjob_history.repository.sequelize',
  '@process-engine/external_task_api_core',
  '@process-engine/external_task_sample_worker',
  '@process-engine/external_task.repository.sequelize',
  '@process-engine/flow_node_instance.repository.sequelize',
  '@process-engine/flow_node_instance.service',
  '@process-engine/iam',
  '@process-engine/logging_api_core',
  '@process-engine/logging.repository.file_system',
  '@process-engine/metrics_api_core',
  '@process-engine/metrics.repository.file_system',
  '@process-engine/process_engine_core',
  '@process-engine/process_model.repository.sequelize',
  '@process-engine/process_model.service',
  '@process-engine/process_model.use_case',
  '.',
];

const iocModules = iocModuleNames.map((moduleName) => {
  return require(`${moduleName}/ioc_module`); //eslint-disable-line
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
