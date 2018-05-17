import * as fs from 'fs';
// tslint:disable-next-line:import-blacklist
import * as _ from 'lodash';
import * as path from 'path';

import {InvocationContainer} from 'addict-ioc';
import {Logger} from 'loggerhythm';

import {ExecutionContext} from '@essential-projects/core_contracts';
import {IProcessEngineService} from '@process-engine/process_engine_contracts';

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
  private _processEngineService: IProcessEngineService;
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

  public async resolveAsync(moduleName: string): Promise<any> {
    return this.container.resolveAsync(moduleName);
  }

  public async getProcessbyId(bpmnFilename: string): Promise<any> {
    const processRepository: any = await this.resolveAsync('ProcessRepository');
    const processes: any = await processRepository.getProcessesByCategory('internal');
    const matchingProcess: any = _.find(processes, (process: any) => {
      return process.name === bpmnFilename;
    });

    return matchingProcess;
  }

  /**
   * Generate an absoulte file path, which points to the bpmn process definition files.
   * @param directoryName Name of the directory, which contains the bpmn files
   */
  private resolvePath(directoryName: string): string {

    // TODO: Maybe refacor.
    // This works, but is not really nice. There are currently some edge cases, where this method
    // method should fail. For Example when there are two nested integration test directories. In a directory
    // structure shuch as /path/to/test/_integration_tests/_integration_tests/ it should fail.

    let rootDirPath: string = process.cwd();
    const integrationTestDirName: string = '_integration_tests';

    if (!rootDirPath.endsWith(integrationTestDirName)) {
      rootDirPath = path.join(rootDirPath, integrationTestDirName);
    }

    return path.join(rootDirPath, directoryName);
  }

  /**
   * Load all given processes with their matching process definition files.
   * @param filelist List of the process definition bpmn files. The filename must end with .bmpn.
   * @param directoryName If set, load the bpmn process definition file from this directory. If unset, use
   * bpmn/  as a default directory.
   */
  public async loadProcessesFromBPMNFiles(filelist: Array<string>, directoryName: string = 'bpmn'): Promise<void> {
    // Load the Process Definition Entity Type Service once to prevent an ioc container lookup on every iteration.
    const processDefEntityTypeService: any = await this.container.resolveAsync('ProcessDefEntityTypeService');

    // Check, if the current working directory is the directory specified in integrationTestDirName.
    // If not, append the name to the rootDirPath.
    // This is necessary, because jenkins fails to start the tests, since the cwd on jenkins
    // is different then on the local machine while running the tests.
    const bpmnDirPath: string = this.resolvePath(directoryName);

    for (const file of filelist) {
      const filePath: string = path.join(bpmnDirPath, file);
      await this.getProcessFromFile(filePath, processDefEntityTypeService);
    }
  }

  /**
   * Load a process definition with the given name.
   * @param bpmnFilename Filename of the process definition
   * @param processDefEntityTypeServiceInstance If set, use the given reference to the process definition entity typeservice. If unset, get a new
   * instance by asking the ioc container.
   */
  public async getProcessFromFile(bpmnFilename: string, processDefEntityTypeServiceInstance: any): Promise<any> {
    const processDefEntityTypeService: any = processDefEntityTypeServiceInstance || await this.resolveAsync('ProcessDefEntityTypeService');

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
      }, {
        // Restricted user without access rights to any lanes
        name: 'restrictedUser',
        password: 'testpass',
        roles: ['dummy'],
      }, {
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
