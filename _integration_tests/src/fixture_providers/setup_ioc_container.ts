import {InvocationContainer} from 'addict-ioc';

const iocModuleNames: Array<string> = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/event_aggregator',
  '@essential-projects/http',
  '@essential-projects/http_extension',
  '@essential-projects/sequelize_connection_manager',
  '@essential-projects/timing',
  '@process-engine/consumer_api_core',
  '@process-engine/correlation.service',
  '@process-engine/correlations.repository.sequelize',
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

const iocModules: Array<any> = iocModuleNames.map((moduleName: string): any => {
  // eslint-disable-next-line
  return require(`${moduleName}/ioc_module`);
});

export async function initializeBootstrapper(): Promise<InvocationContainer> {

  const container: InvocationContainer = new InvocationContainer({
    defaults: {
      conventionCalls: ['initialize'],
    },
  });

  for (const iocModule of iocModules) {
    iocModule.registerInContainer(container);
  }

  container.validateDependencies();

  return container;
}
