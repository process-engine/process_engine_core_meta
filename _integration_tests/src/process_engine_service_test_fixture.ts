const setup = require('../../test_setup');

export class ProcessEngineServiceTestFixture {
    private bpmnFilename: string;
    private httpBootstrapper: any;
    private processEngineService : any;
    private dummyExecutionContext: any;
    
    constructor(bpmnFilename: string) {
        this.bpmnFilename = bpmnFilename;
    }

    public async setup(): Promise<void> {
        this.httpBootstrapper = await setup.initializeBootstrapper();
        await this.httpBootstrapper.start();
        this.dummyExecutionContext = await setup.createExecutionContext();
        this.processEngineService = await setup.resolveAsync('ProcessEngineService');
        await setup.importBPMNFromFile(this.dummyExecutionContext, this.bpmnFilename);
    }

    public async executeProcess(processKey: string): Promise<any> {
        const initialToken = {};
        return this.processEngineService.executeProcess(this.dummyExecutionContext, undefined, processKey, initialToken);
    }

    public async tearDown(): Promise<void> {
        await this.httpBootstrapper.reset();
        await this.httpBootstrapper.shutdown();
    }
}
