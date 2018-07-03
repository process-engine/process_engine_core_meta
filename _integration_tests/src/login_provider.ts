import {HttpService} from '@essential-projects/services';
import {IAMService} from '@process-engine/iam';

import {Logger} from 'loggerhythm';

const logger: Logger = Logger.createLogger('test:login_provider');

export async function loginUserAndReturnToken(): Promise<string> {
  const httpClient: HttpService = new HttpService();
  const iamService: IAMService = new IAMService(httpClient);
  (iamService as any).config = {
    claimPath: 'http://localhost:5000/claims/ensure',
  };

  const authRoute: string = 'http://localhost:5000/connect/token';

  const requestHeaders: any = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const payload: any = {
    grant_type: 'password',
    client_id: 'iam_integration_test_client',
    client_secret: 'test',
    scope: 'test_resource',
    username: 'alice',
    password: 'Admin1234*',
  };

  try {
    const response: any = await httpClient.post(authRoute, payload, requestHeaders);
    const userToken: string = response.result.access_token;

    logger.info('Successfully logged in the test user and received an auth token!');

    return userToken;
  } catch (error) {
    logger.error('Recevied an error from the identity server!');
    logger.error(error);
    throw error;
  }

}
