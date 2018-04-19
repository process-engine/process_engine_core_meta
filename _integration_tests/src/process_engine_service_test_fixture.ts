const setup = require('../../test_setup');

const _ = require('lodash');

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

  public async resolveAsync(registrationName: string): Promise<any> {
    return setup.resolveAsync(registrationName);
  }

  public async executeProcess(processKey: string, initialToken: any = {}): Promise<any> {
    return this.processEngineService.executeProcess(this.dummyExecutionContext, undefined, processKey, initialToken);
  }

  public async getProcessbyId(bpmnFilename: string): Promise<any> {
    const processRepository = await setup.resolveAsync('ProcessRepository');
    const processes = await processRepository.getProcessesByCategory('internal');
  
    const matchingProcess = _.find(processes, (process) => {
      return process.name === bpmnFilename;
    });
  
    return matchingProcess;
  }

  public async getProcessFromFile(bpmnFilename: string): Promise<any> {
    return setup.importBPMNFromFile(this.dummyExecutionContext, bpmnFilename);
  }

  public async tearDown(): Promise<void> {
    await this.httpBootstrapper.reset();
    await this.httpBootstrapper.shutdown();
  }
}