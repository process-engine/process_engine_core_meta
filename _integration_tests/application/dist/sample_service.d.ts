export declare class SampleService {
    currentTokenTestPart1(): Promise<string>;
    currentTokenTestPart2(currentTokenValue: string): Promise<string>;
    longRunningFunction(): Promise<string>;
    veryLongRunningFunction(): Promise<string>;
    secondVeryLongRunningFunction(): Promise<string>;
    sequenceTestPart2UpdateToken(currentToken: string): Promise<string>;
    sequenceTestPart3Delay(): Promise<void>;
    private wait(milliseconds);
}
