const setup = require('../../test_setup');

export class ProcessEngineServiceTestFixture {
  private httpBootstrapper: any;
  private processEngineService : any;
  private dummyExecutionContext: any;

  public async setup(): Promise<void> {
    this.httpBootstrapper = await setup.initializeBootstrapper();
    await this.httpBootstrapper.start();
    this.dummyExecutionContext = await setup.createExecutionContext();
    this.processEngineService = await setup.resolveAsync('ProcessEngineService');
  }

  public async executeProcess(processKey: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcess(this.dummyExecutionContext, undefined, processKey, initialToken);
  }

  public async getProcessFromFile(bpmnFilename: string): Promise<any> {
    return setup.importBPMNFromFile(this.dummyExecutionContext, bpmnFilename);
  }

  public async tearDown(): Promise<void> {
    await this.httpBootstrapper.reset();
    await this.httpBootstrapper.shutdown();
  }
}