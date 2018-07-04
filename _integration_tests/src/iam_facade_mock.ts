import {IIdentity} from '@essential-projects/iam_contracts';
import {IIamFacade} from '@process-engine/process_engine_contracts';

export class IamFacadeMock implements IIamFacade {

  public async checkIfUserCanAccessLane(identity: IIdentity, laneId: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
