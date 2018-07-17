import * as path from 'path';

import {InvocationContainer} from 'addict-ioc';
import {Logger} from 'loggerhythm';

import {
  ExecutionContext,
  IProcessEngineService,
  IProcessRepository,
} from '@process-engine/process_engine_contracts';

import {ConsumerContext, IConsumerApiService} from '@process-engine/consumer_api_contracts';

import {IIdentity} from '@essential-projects/iam_contracts';

const logger: Logger = Logger.createLogger('test:bootstrapper');

const iocModuleNames: Array<string> = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/event_aggregator',
  '@essential-projects/http_extension',
  '@essential-projects/http_integration_testing',
  '@essential-projects/services',
  '@essential-projects/timing',
  '@process-engine/consumer_api_core',
  '@process-engine/flow_node_instance.repository.sequelize',
  '@process-engine/iam',
  '@process-engine/process_engine',
  '@process-engine/process_model.repository.sequelize',
  '@process-engine/process_repository',
  '../../',
];

const iocModules: Array<any> = iocModuleNames.map((moduleName: string): any => {
  return require(`${moduleName}/ioc_module`);
});

export class TestFixtureProvider {
  private _processEngineService: IProcessEngineService;
  private _executionContext: ExecutionContext;

  private container: InvocationContainer;
  private bootstrapper: any;

  private _consumerApiService: IConsumerApiService;
  private _consumerContext: ConsumerContext;

  public get context(): ExecutionContext {
    return this._executionContext;
  }

  public get consumerContext(): ConsumerContext {
    return this._consumerContext;
  }

  public get processEngineService(): IProcessEngineService {
    return this._processEngineService;
  }

  public get consumerApiService(): IConsumerApiService {
    return this._consumerApiService;
  }

  public async initializeAndStart(): Promise<void> {
    await this.initializeBootstrapper();

    await this.bootstrapper.start();

    this._createMockContexts();

    this._processEngineService = await this.resolveAsync<IProcessEngineService>('ProcessEngineService');
    this._consumerApiService = await this.resolveAsync<IConsumerApiService>('ConsumerApiService');
  }

  public async executeProcess(processKey: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcess(this.context, undefined, processKey, initialToken);
  }

  // -- TODO: Refactor TerminateEndEvent tests and remove these methods afterwards
  public async createProcessInstance(processModelKey: string): Promise<any> {
    return this.processEngineService.createProcessInstance(this.context as any, undefined, processModelKey);
  }

  public async executeProcessInstance(processInstanceId: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcessInstance(this.context as any, processInstanceId, undefined, initialToken);
  }
  // --

  public async resolveAsync<T>(moduleName: string): Promise<any> {
    return this.container.resolveAsync<T>(moduleName);
  }

  public async getProcessbyId(bpmnFilename: string): Promise<any> {
    const processRepository: any = await this.resolveAsync<IProcessRepository>('ProcessRepository');
    const processes: any = await processRepository.getProcessesByCategory('internal');
    const matchingProcess: any = processes.find((process: any) => {
      return process.name === bpmnFilename;
    });

    return matchingProcess;
  }

  /**
   * Generate an absoulte path, which points to the bpmn directory.
   *
   * Checks if the cwd is "_integration_tests". If not, that directory name is appended.
   * This is necessary, because Jenkins uses a different cwd than the local machines do.
   *
   * @param directoryName Name of the directory, which contains the bpmn files
   */
  private resolvePath(directoryName: string = 'bpmn'): string {
    let rootDirPath: string = process.cwd();
    const integrationTestDirName: string = '_integration_tests';

    if (!rootDirPath.endsWith(integrationTestDirName)) {
      rootDirPath = path.join(rootDirPath, integrationTestDirName);
    }

    return path.join(rootDirPath, directoryName);
  }

  public async tearDown(): Promise<void> {
    await this.bootstrapper.reset();
    await this.bootstrapper.shutdown();
  }

  private async initializeBootstrapper(): Promise<void> {

    try {
      this.container = new InvocationContainer({
        defaults: {
          conventionCalls: ['initialize'],
        },
      });

      for (const iocModule of iocModules) {
        iocModule.registerInContainer(this.container);
      }

      this.container.validateDependencies();

      const appPath: string = path.resolve(__dirname);
      this.bootstrapper = await this.container.resolveAsync('HttpIntegrationTestBootstrapper', [appPath]);

      logger.info('Bootstrapper started.');
    } catch (error) {
      logger.error('Failed to start bootstrapper!', error);
      throw error;
    }
  }

  private _createMockContexts(): void {

    // Note: Since the iam service is mocked, it doesn't matter what kind of token is used here.
    // It only matters that one is present.
    const identity: IIdentity = {
      token: 'randomtoken',
    };
    this._executionContext = new ExecutionContext(identity);

    this._consumerContext = <ConsumerContext> {
      identity: 'randomtoken',
    };
  }
}
