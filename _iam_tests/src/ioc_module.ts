import {HttpService} from '@essential-projects/services';

export function registerInContainer(container: any): void {

  // Override IOC Registrations for the @essential-projects/services module to avoid unnecessary dependency chains.
  // We only need the HttpService anyway.
  container.register('HttpService', HttpService)
    .singleton();
}
