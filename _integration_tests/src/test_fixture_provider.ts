import * as fs from 'fs';
import * as path from 'path';

import {InvocationContainer} from 'addict-ioc';
import {Logger} from 'loggerhythm';

import {AppBootstrapper} from '@essential-projects/bootstrapper_node';
import {
  ExecutionContext,
  IExecuteProcessService,
  IExecutionContextFacade,
  IExecutionContextFacadeFactory,
  IImportProcessService,
  IProcessModelService,
  Model,
} from '@process-engine/process_engine_contracts';

import {ConsumerContext, IConsumerApiService} from '@process-engine/consumer_api_contracts';

import {IIdentity, IIdentityService} from '@essential-projects/iam_contracts';

const logger: Logger = Logger.createLogger('test:bootstrapper');

const iocModuleNames: Array<string> = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/event_aggregator',
  '@essential-projects/services',
  '@process-engine/consumer_api_core',
  '@process-engine/flow_node_instance.repository.sequelize',
  '@process-engine/iam',
  '@process-engine/process_engine',
  '@process-engine/process_model.repository.sequelize',
  '@process-engine/timers.repository.sequelize',
  '../../',
];

const iocModules: Array<any> = iocModuleNames.map((moduleName: string): any => {
  return require(`${moduleName}/ioc_module`);
});

export class TestFixtureProvider {
  private _executeProcessService: IExecuteProcessService;
  private _executionContextFacade: IExecutionContextFacade;

  private container: InvocationContainer;
  private bootstrapper: AppBootstrapper;

  private _consumerApiService: IConsumerApiService;
  private _consumerContext: ConsumerContext;

  public get executionContextFacade(): IExecutionContextFacade {
    return this._executionContextFacade;
  }

  public get consumerContext(): ConsumerContext {
    return this._consumerContext;
  }

  public get executeProcessService(): IExecuteProcessService {
    return this._executeProcessService;
  }

  public get consumerApiService(): IConsumerApiService {
    return this._consumerApiService;
  }

  public async initializeAndStart(): Promise<void> {
    await this.initializeBootstrapper();

    await this.bootstrapper.start();

    this._createMockContexts();

    this._executeProcessService = await this.resolveAsync<IExecuteProcessService>('ExecuteProcessService');
    this._consumerApiService = await this.resolveAsync<IConsumerApiService>('ConsumerApiService');
  }

  public async tearDown(): Promise<void> {
    await this.bootstrapper.stop();
  }

  public async resolveAsync<T>(moduleName: string): Promise<any> {
    return this.container.resolveAsync<T>(moduleName);
  }

  public async importProcessFiles(processFileNames: Array<string>): Promise<void> {

    const importService: IImportProcessService = await this.resolveAsync<IImportProcessService>('ImportProcessService');

    for (const processFileName of processFileNames) {
      await this.registerProcess(processFileName, importService);
    }
  }

  public readProcessModelFile(processFileName: string): string {

    const bpmnFolderPath: string = this.getBpmnDirectoryPath();
    const fullFilePath: string = path.join(bpmnFolderPath, `${processFileName}.bpmn`);

    const fileContent: string = fs.readFileSync(fullFilePath, 'utf-8');

    return fileContent;
  }

  public async executeProcess(processKey: string, startEventKey: string, correlationId: string, initialToken: any = {}): Promise<any> {

    const processModel: Model.Types.Process = await this._getProcessById(processKey);

    return this
      .executeProcessService
      .startAndAwaitEndEvent(this.executionContextFacade, processModel, startEventKey, correlationId, initialToken);
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
      this.bootstrapper = await this.container.resolveAsync<AppBootstrapper>('AppBootstrapper', [appPath]);

      logger.info('Bootstrapper started.');
    } catch (error) {
      logger.error('Failed to start bootstrapper!', error);
      throw error;
    }
  }

  private async _createMockContexts(): Promise<void> {

    // Note: Since the iam service is mocked, it doesn't matter what kind of token is used here.
    // It only matters that one is present.
    const identity: IIdentity = {
      token: 'randomtoken',
    };

    this._consumerContext = <ConsumerContext> {
      identity: 'randomtoken',
    };

    const executionContext: ExecutionContext = new ExecutionContext(identity);

    const executionContextFacadeFactory: IExecutionContextFacadeFactory =
      await this.resolveAsync<IExecutionContextFacadeFactory>('ExecutionContextFacadeFactory');

    this._executionContextFacade = executionContextFacadeFactory.create(executionContext);
  }

  private async registerProcess(processFileName: string, importService: IImportProcessService): Promise<void> {

    const executionContext: ExecutionContext = this.executionContextFacade.getExecutionContext();

    const bpmnDirectoryPath: string = this.getBpmnDirectoryPath();
    const processFilePath: string = path.join(bpmnDirectoryPath, `${processFileName}.bpmn`);

    await importService.importBpmnFromFile(executionContext, processFilePath, true);
  }

  /**
   * Generate an absoulte path, which points to the bpmn directory.
   *
   * Checks if the cwd is "_integration_tests". If not, that directory name is appended.
   * This is necessary, because Jenkins uses a different cwd than the local machines do.
   */
  public getBpmnDirectoryPath(): string {

    const bpmnDirectoryName: string = 'bpmn';
    let rootDirPath: string = process.cwd();
    const integrationTestDirName: string = '_integration_tests';

    if (!rootDirPath.endsWith(integrationTestDirName)) {
      rootDirPath = path.join(rootDirPath, integrationTestDirName);
    }

    return path.join(rootDirPath, bpmnDirectoryName);
  }

  private async _getProcessById(processId: string): Promise<Model.Types.Process> {

    const processModelService: IProcessModelService =
      await this.resolveAsync<IProcessModelService>('ProcessModelService');

    const processModel: Model.Types.Process = await processModelService.getProcessModelById(this.executionContextFacade, processId);

    return processModel;
  }
}
