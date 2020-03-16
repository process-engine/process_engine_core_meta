
import {InvocationContainer} from 'addict-ioc';

import {ConsumerApiClient, InternalAccessor} from '@process-engine/consumer_api_client';

import {IamServiceMock} from '../mocks/index';
import {
  ExternalTaskSampleWorker,
  ParallelGatewayTestService,
  ServiceTaskTestService,
} from '../test_services/index';

export function registerInContainer(container: InvocationContainer): void {

  container
    .register('ConsumerApiInternalAccessor', InternalAccessor)
    .dependencies(
      'ConsumerApiApplicationInfoService',
      'ConsumerApiEmptyActivityService',
      'ConsumerApiEventService',
      'ConsumerApiExternalTaskService',
      'ConsumerApiManualTaskService',
      'ConsumerApiNotificationService',
      'ConsumerApiProcessModelService',
      'ConsumerApiUserTaskService',
      'ConsumerApiFlowNodeInstanceService',
    );

  container
    .register('ConsumerApiClient', ConsumerApiClient)
    .dependencies('ConsumerApiInternalAccessor');

  container
    .register('ExternalTaskSampleWorker', ExternalTaskSampleWorker)
    .dependencies('IdentityService')
    .configure('external_task:sample_worker')
    .singleton();

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);
  container.register('ServiceTaskTestService', ServiceTaskTestService);

  // This removes the necessity for having a running IdentityServer during testing.
  container
    .register('IamService', IamServiceMock)
    .singleton();
}
