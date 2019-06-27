/* eslint-disable @typescript-eslint/member-naming */
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import * as path from 'path';

import {InvocationContainer} from 'addict-ioc';

import {Logger} from 'loggerhythm';

import {AppBootstrapper} from '@essential-projects/bootstrapper_node';
import {HttpExtension} from '@essential-projects/http_extension';
import {IIdentity, TokenBody} from '@essential-projects/iam_contracts';

import {IConsumerApi} from '@process-engine/consumer_api_contracts';
import {ExternalTaskSampleWorker} from '@process-engine/external_task_sample_worker';
import {IExecuteProcessService} from '@process-engine/process_engine_contracts';
import {IProcessModelUseCases} from '@process-engine/process_model.contracts';

import {initializeBootstrapper} from './setup_ioc_container';

const logger: Logger = Logger.createLogger('test:bootstrapper');

export type IdentityCollection = {
  defaultUser: IIdentity;
  restrictedUser: IIdentity;
};

export class TestFixtureProvider {

  private bootstrapper: AppBootstrapper;
  private container: InvocationContainer;

  private sampleExternalTaskWorker: ExternalTaskSampleWorker;

  private _consumerApiService: IConsumerApi;
  private _executeProcessService: IExecuteProcessService;
  private _processModelUseCases: IProcessModelUseCases;

  private _identities: IdentityCollection;

  public get consumerApiService(): IConsumerApi {
    return this._consumerApiService;
  }

  public get executeProcessService(): IExecuteProcessService {
    return this._executeProcessService;
  }

  public get processModelUseCases(): IProcessModelUseCases {
    return this._processModelUseCases;
  }

  public get identities(): IdentityCollection {
    return this._identities;
  }

  public async initializeAndStart(): Promise<void> {

    await this.initializeBootstrapper();

    await this.bootstrapper.start();

    await this.createMockIdentities();

    this._consumerApiService = await this.resolveAsync<IConsumerApi>('ConsumerApiService');
    this._executeProcessService = await this.resolveAsync<IExecuteProcessService>('ExecuteProcessService');
    this._processModelUseCases = await this.resolveAsync<IProcessModelUseCases>('ProcessModelUseCases');

    this.sampleExternalTaskWorker = await this.resolveAsync<ExternalTaskSampleWorker>('ExternalTaskSampleWorker');
    this.sampleExternalTaskWorker.start();
  }

  public async tearDown(): Promise<void> {
    this.sampleExternalTaskWorker.stop();
    const httpExtension = await this.container.resolveAsync<HttpExtension>('HttpExtension');
    await httpExtension.close();
    await this.bootstrapper.stop();
  }

  public resolve<TModule>(moduleName: string, args?: any): TModule {
    return this.container.resolve<TModule>(moduleName, args);
  }

  public async resolveAsync<TModule>(moduleName: string, args?: any): Promise<TModule> {
    return this.container.resolveAsync<TModule>(moduleName, args);
  }

  public async importProcessFiles(processFileNames: Array<string>): Promise<void> {

    for (const processFileName of processFileNames) {
      await this.registerProcess(processFileName);
    }
  }

  public readProcessModelFile(processFileName: string): string {

    const bpmnFolderPath = this.getBpmnDirectoryPath();
    const fullFilePath = path.join(bpmnFolderPath, `${processFileName}.bpmn`);

    const fileContent = fs.readFileSync(fullFilePath, 'utf-8');

    return fileContent;
  }

  public getBpmnDirectoryPath(): string {

    const bpmnDirectoryName = 'bpmn';
    let rootDirPath = process.cwd();
    const integrationTestDirName = '_integration_tests';

    if (!rootDirPath.endsWith(integrationTestDirName)) {
      rootDirPath = path.join(rootDirPath, integrationTestDirName);
    }

    return path.join(rootDirPath, bpmnDirectoryName);
  }

  public async executeProcess(processModelId: string, startEventId: string, correlationId: string, initialToken: any = {}): Promise<any> {
    return this
      .executeProcessService
      .startAndAwaitEndEvent(this.identities.defaultUser, processModelId, correlationId, startEventId, initialToken);
  }

  private async initializeBootstrapper(): Promise<void> {

    try {
      this.container = await initializeBootstrapper();

      const appPath = path.resolve(__dirname);
      this.bootstrapper = await this.container.resolveAsync<AppBootstrapper>('AppBootstrapper', [appPath]);

      logger.info('Bootstrapper started.');
    } catch (error) {
      logger.error('Failed to start bootstrapper!', error);
      throw error;
    }
  }

  private async createMockIdentities(): Promise<void> {

    this._identities = {
      // all access user
      defaultUser: await this.createIdentity('defaultUser'),
      // no access user
      restrictedUser: await this.createIdentity('restrictedUser'),
    };
  }

  private async createIdentity(username: string): Promise<IIdentity> {

    const tokenBody: TokenBody = {
      sub: username,
      name: 'hellas',
    };

    const signOptions: jsonwebtoken.SignOptions = {
      expiresIn: 60,
    };

    const encodedToken = jsonwebtoken.sign(tokenBody, 'randomkey', signOptions);

    return {
      token: encodedToken,
      userId: username,
    };
  }

  private async registerProcess(processFileName: string): Promise<void> {
    const xml = this.readProcessModelFromFile(processFileName);
    await this.processModelUseCases.persistProcessDefinitions(this.identities.defaultUser, processFileName, xml, true);
  }

  private readProcessModelFromFile(fileName: string): string {

    const bpmnDirectoryPath = this.getBpmnDirectoryPath();
    const processModelPath = path.join(bpmnDirectoryPath, `${fileName}.bpmn`);

    const processModelAsXml = fs.readFileSync(processModelPath, 'utf-8');

    return processModelAsXml;
  }

}
