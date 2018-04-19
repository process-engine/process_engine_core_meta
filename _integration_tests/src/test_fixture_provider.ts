import * as path from 'path';
import * as fs from 'fs';

import {InvocationContainer} from 'addict-ioc';
import {Logger} from 'loggerhythm';

import {IProcessEngineService} from '@process-engine/process_engine_contracts';
import { ExecutionContext } from '../../core_contracts/dist/execution_context';

const logger: Logger = Logger.createLogger('test:bootstrapper');

const iocModuleNames: Array<string> = [
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
  '../../',
];

const iocModules: Array<any> = iocModuleNames.map((moduleName: string): any => {
  return require(`${moduleName}/ioc_module`);
});

export class TestFixtureProvider {
  private httpBootstrapper: any;
  private _processEngineService : IProcessEngineService;
  private _dummyExecutionContext: ExecutionContext;

  private container: InvocationContainer;
  private bootstrapper: any;

  public get context(): ExecutionContext {
    return this._dummyExecutionContext;
  }

  public get processEngineService(): IProcessEngineService {
    return this._processEngineService;
  }

  public async initializeAndStart(): Promise<void> {
    this.httpBootstrapper = await this.initializeBootstrapper();
    await this.httpBootstrapper.start();
    this._dummyExecutionContext = await this.createExecutionContext();
    this._processEngineService = await this.resolveAsync('ProcessEngineService');
  }

  public async executeProcess(processKey: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcess(this.context, undefined, processKey, initialToken);
  }

  public async createProcessInstance(processModelKey: string): Promise<any> {
    return this.processEngineService.createProcessInstance(this.context, undefined, processModelKey);
  }

  public async executeProcessInstance(processInstanceId: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcessInstance(this.context, processInstanceId, undefined, initialToken);
  }
  
  public async resolveAsync(moduleName): Promise<any> {
    return this.container.resolveAsync(moduleName);
  };

  public async getProcessFromFile(bpmnFilename: string): Promise<any> {
    const processDefEntityTypeService: any = await this.container.resolveAsync('ProcessDefEntityTypeService');
    return processDefEntityTypeService.importBpmnFromFile(this.context, {
      file: bpmnFilename,
    });
  }

  public async tearDown(): Promise<void> {
    await this.httpBootstrapper.reset();
    await this.httpBootstrapper.shutdown();
  }

  private async initializeBootstrapper(): Promise<any> {
  
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
  
      const identityFixtures: Array<any> = [{
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
  
      this.bootstrapper.addFixtures('User', identityFixtures);
  
      logger.info('Bootstrapper started.');
  
      return this.bootstrapper;
    } catch (error) {
      logger.error('Failed to start bootstrapper!', error);
      throw error;
    }
  }
  
  private async createExecutionContext(): Promise<any> {
    const iamService: any = await this.container.resolveAsync('IamService');
    const context: any = await iamService.createInternalContext('system');
    return context;
  }
}
