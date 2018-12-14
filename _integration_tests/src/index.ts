import * as Bluebird from 'bluebird';

Bluebird.config({
  cancellation: true,
});

global.Promise = Bluebird;

export * from './fixture_providers/index';
export * from './mocks/index';
export * from './test_services';
