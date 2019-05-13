
import {InvocationContainer} from 'addict-ioc';

import {
  ExternalTaskApiClientService,
  ExternalTaskApiInternalAccessor,
} from '@process-engine/external_task_api_client';
import {
  ParallelGatewayTestService,
  ServiceTaskTestService,
} from '../test_services/index';

import {IamServiceMock} from '../mocks/index';

export function registerInContainer(container: InvocationContainer): void {

  container.register('ExternalTaskApiInternalAccessor', ExternalTaskApiInternalAccessor)
    .dependencies('ExternalTaskApiService');

  container.register('ExternalTaskApiClientService', ExternalTaskApiClientService)
    .dependencies('ExternalTaskApiInternalAccessor');

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);
  container.register('ServiceTaskTestService', ServiceTaskTestService);

  // This removes the necessity for having a running IdentityServer during testing.
  container.register('IamService', IamServiceMock)
    .singleton();
}
