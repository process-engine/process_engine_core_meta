import {Logger} from 'loggerhythm';

const logger: Logger = Logger.createLogger('service_task:service_task_test_bnservice');

export class ServiceTaskTestService {

  /**
   * This is a sample function which justs returns one. Its used
   * in the test cases for the service Tasks.
   */
  public async returnOne(): Promise<number> {
    logger.info('Execute Task: Return One.');

    return 1;
  }
}
