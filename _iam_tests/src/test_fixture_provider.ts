import * as path from 'path';

import {InvocationContainer} from 'addict-ioc';
import {Logger} from 'loggerhythm';

import {IIAMService} from '@essential-projects/iam_contracts';

const logger: Logger = Logger.createLogger('test:bootstrapper');

const iocModuleNames: Array<string> = [
  '@essential-projects/bootstrapper',
  '@essential-projects/bootstrapper_node',
  '@essential-projects/http_extension',
  '@essential-projects/http_integration_testing',
  '@process-engine/iam',
  '.',
];

const iocModules: Array<any> = iocModuleNames.map((moduleName: string): any => {
  return require(`${moduleName}/ioc_module`);
});

export class TestFixtureProvider {

  private container: InvocationContainer;
  private bootstrapper: any;

  private _iamService: IIAMService;

  public get iamService(): IIAMService {
    return this._iamService;
  }

  public async initializeAndStart(): Promise<void> {
    await this.initializeBootstrapper();

    await this.bootstrapper.start();

    this._iamService = await this.resolveAsync('IamService');
  }

  public async resolveAsync<T>(moduleName: string): Promise<any> {
    return this.container.resolveAsync<T>(moduleName);
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
}
