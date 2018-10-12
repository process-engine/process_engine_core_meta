'use strict';

import * as should from 'should';
import * as uuid from 'uuid';

import {IIdentity} from '@essential-projects/iam_contracts';

import {
  ProcessStartRequestPayload,
  ProcessStartResponsePayload,
  StartCallbackType,
  UserTask,
  UserTaskList,
} from '@process-engine/consumer_api_contracts';

import {IFlowNodeInstanceService, Runtime} from '@process-engine/process_engine_contracts';

import {TestFixtureProvider} from './test_fixture_provider';

/**
 * This class handles the creation of process instances and waits for a process instance to reach a user task.
 *
 * Only to be used in conjunction with the user task tests.
 */
export class ProcessInstanceHandler {

  private _testFixtureProvider: TestFixtureProvider;

  constructor(testFixtureProvider: TestFixtureProvider) {
    this._testFixtureProvider = testFixtureProvider;
  }

  private get testFixtureProvider(): TestFixtureProvider {
    return this._testFixtureProvider;
  }

  public async startProcessInstanceAndReturnCorrelationId(processModelId: string, correlationId?: string, inputValues?: any): Promise<string> {

    const startEventId: string = 'StartEvent_1';
    const startCallbackType: StartCallbackType = StartCallbackType.CallbackOnProcessInstanceCreated;
    const payload: ProcessStartRequestPayload = {
      correlationId: correlationId || uuid.v4(),
      inputValues: inputValues || {},
    };

    const result: ProcessStartResponsePayload = await this.testFixtureProvider
      .consumerApiService
      .startProcessInstance(this.testFixtureProvider.identities.defaultUser, processModelId, startEventId, payload, startCallbackType);

    return result.correlationId;
  }

  public async waitForProcessInstanceToReachUserTask(correlationId: string, processModelId?: string): Promise<void> {

    const maxNumberOfRetries: number = 30;
    const delayBetweenRetriesInMs: number = 500;

    const flowNodeInstanceService: IFlowNodeInstanceService = await this.testFixtureProvider.resolveAsync('FlowNodeInstanceService');

    for (let i: number = 0; i < maxNumberOfRetries; i++) {

      await this.wait(delayBetweenRetriesInMs);

      let flowNodeInstances: Array<Runtime.Types.FlowNodeInstance> = await flowNodeInstanceService.querySuspendedByCorrelation(correlationId);

      if (processModelId) {
        flowNodeInstances = flowNodeInstances.filter((fni: Runtime.Types.FlowNodeInstance) => {
          return fni.tokens[0].processModelId === processModelId;
        });
      }

      if (flowNodeInstances.length >= 1) {
        return;
      }
    }

    throw new Error(`No process instance within correlation '${correlationId}' found! The process instance likely failed to start!`);
  }

  /**
   * Returns all user tasks that are running with the given correlation id.
   *
   * @async
   * @param   identity      The identity with which to get the UserTask.
   * @param   correlationId The ID of the Correlation for which to get the UserTasks.
   * @returns               A list of waiting UserTasks.
   */
  public async getWaitingUserTasksForCorrelationId(identity: IIdentity, correlationId: string): Promise<UserTaskList> {

    return this.testFixtureProvider
      .consumerApiService
      .getUserTasksForCorrelation(identity, correlationId);
  }

  /**
   * Finishes a UserTask and returns its result.
   *
   * @async
   * @param   identity       The identity with which to finish the UserTask.
   * @param   correlationId  The ID of the Correlation for which to finish
   *                         the UserTask.
   * @param   processModelId The ID of the ProcessModel for which to finish
   *                         the UserTask.
   * @param   userTaskId     The ID of the UserTask to finish.
   * @param   userTaskInput  The input data with which to finish the UserTask.
   * @returns                The result of the finishing operation.
   */
  public async finishUserTaskInCorrelation(identity: IIdentity,
                                           correlationId: string,
                                           processModelId: string,
                                           userTaskId: string,
                                           userTaskInput: any): Promise<any> {

    const waitingUserTasks: UserTaskList = await this.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(waitingUserTasks).have.property('userTasks');
    should(waitingUserTasks.userTasks.length).be.equal(1, 'The process should have one waiting user task');

    const waitingUserTask: UserTask = waitingUserTasks.userTasks[0];

    should(waitingUserTask.id).be.equal(userTaskId);

    const userTaskResult: any =
      await this.testFixtureProvider
        .consumerApiService
        .finishUserTask(identity, processModelId, correlationId, waitingUserTask.id, userTaskInput);

    return userTaskResult;
  }

  /**
   * Delays test execution by the given amount of time.
   *
   * @async
   * @param delayTimeInMs The amount of time in ms by which to delay
   *                      test execution.
   */
  public async wait(delayTimeInMs: number): Promise<void> {
    await new Promise((resolve: Function): void => {
      setTimeout(() => {
        resolve();
      }, delayTimeInMs);
    });
  }

}
