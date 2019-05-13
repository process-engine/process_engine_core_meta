import {ForbiddenError} from '@essential-projects/errors_ts';
import {IIAMService, IIdentity} from '@essential-projects/iam_contracts';

export class IamServiceMock implements IIAMService {

  private claimConfigs: {[userName: string]: Array<string>} = {
    // Can access everything
    defaultUser: [
      'can_read_process_model',
      'can_delete_process_model',
      'can_write_process_model',
      'can_access_external_tasks',
      'can_subscribe_to_events',
      'can_trigger_messages',
      'can_trigger_signals',
      'Default_Test_Lane',
      'LaneA',
      'LaneB',
      'LaneC',
    ],
  };

  public async ensureHasClaim(identity: IIdentity, claimName: string): Promise<void> {

    // The dummy token is used by the AutoStartService and must always be passed.
    const isDummyToken = identity.userId === 'dummy_token';
    if (isDummyToken) {
      return Promise.resolve();
    }

    const matchingUserConfig = this.claimConfigs[identity.userId];
    if (!matchingUserConfig) {
      throw new ForbiddenError('access denied');
    }

    const userHasClaim = matchingUserConfig.some((claim: string): boolean => {
      return claim === claimName;
    });

    if (!userHasClaim) {
      throw new ForbiddenError('access denied');
    }

    return Promise.resolve();
  }

}
