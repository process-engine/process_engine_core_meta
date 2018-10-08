'use strict';

const {
  ExternalTaskApiClientService,
  ExternalTaskApiInternalAccessor,
} = require('@process-engine/external_task_api_client');

const {
  IamServiceMock,
  ParallelGatewayTestService,
  ServiceTaskTestService,
} = require('./dist/commonjs/index');

const registerInContainer = (container) => {

  container.register('ExternalTaskApiInternalAccessor', ExternalTaskApiInternalAccessor)
    .dependencies('ExternalTaskApiService');

  container.register('ExternalTaskApiClientService', ExternalTaskApiClientService)
    .dependencies('ExternalTaskApiInternalAccessor');

  container.register('ParallelGatewayTestService', ParallelGatewayTestService);
  container.register('ServiceTaskTestService', ServiceTaskTestService);

  // This removes the necessity for having a running IdentityServer during testing.
  container.register('IamService', IamServiceMock);
};

module.exports.registerInContainer = registerInContainer;
