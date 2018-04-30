import {Logger} from 'loggerhythm';

const logger: Logger = Logger.createLogger('service_task:service_task_test_bnservice');

export class ServiceTaskTestService {

  /**
   * This is a sample function which justs returns one. Its used
   * in the test cases for the service Tasks.
   */
  public async returnOne(): Promise<number> {
    logger.info('Starting Service: Return One.');

    return 1;
  }

  public async returnObject(): Promise<any> {
    logger.info('Starting Service: Return Object');

    return {
      prop1: 1337,
      prop2: 'Hello World',
    };
  }

  /**
   * Simple function that just returns the given message.
   * @param message Message, that should be echoed.
   */
  public async echoParameter(message: string): Promise<string> {
    logger.info('Starting Service: Echo Parameter');

    return message;
  }

  public async addNumbers(firstNumber: number, secondNumber: number): Promise<number> {
    logger.info('Starting Service: Add Numbers');

    return firstNumber + secondNumber;
  }
}
