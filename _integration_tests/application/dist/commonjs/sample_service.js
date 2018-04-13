"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loggerhythm_1 = require("loggerhythm");
const logger = loggerhythm_1.Logger.createLogger('parallel_gateway:sample_service');
class SampleService {
    async currentTokenTestPart1() {
        const currentTokenValue = 'current token test value';
        logger.info(`Setting the expected token.current value to: ${currentTokenValue}`);
        return currentTokenValue;
    }
    async currentTokenTestPart2(currentTokenValue) {
        logger.info(`currentTokenTestPart2 has received current token: ${currentTokenValue}`);
        return currentTokenValue;
    }
    async longRunningFunction() {
        await this.wait(1000);
        logger.info('longRunningFunction has finished');
        return 'longRunningFunction has finished';
    }
    async veryLongRunningFunction() {
        await this.wait(3000);
        logger.info('veryLongRunningFunction has finished');
        return 'veryLongRunningFunction has finished';
    }
    async secondVeryLongRunningFunction() {
        await this.wait(3000);
        logger.info('secondVeryLongRunningFunction has finished');
        return 'secondVeryLongRunningFunction has finished';
    }
    async sequenceTestPart2UpdateToken(currentToken) {
        await this.wait(500);
        logger.info(`sequenceTestPart2UpdateToken has received current token: ${currentToken}`);
        const updatedToken = `UPDATED ${currentToken}`;
        logger.info(`updated token: ${updatedToken}`);
        return updatedToken;
    }
    async sequenceTestPart3Delay() {
        await this.wait(1700);
        logger.info('sequenceTestPart3Delay has finished');
    }
    wait(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    }
}
exports.SampleService = SampleService;

//# sourceMappingURL=sample_service.js.map
