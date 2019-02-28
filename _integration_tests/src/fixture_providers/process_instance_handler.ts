'use strict';

import * as uuid from 'node-uuid';

import {EventReceivedCallback, IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {IIdentity} from '@essential-projects/iam_contracts';

import {DataModels} from '@process-engine/consumer_api_contracts';

import {FlowNodeInstance, IFlowNodeInstanceService} from '@process-engine/flow_node_instance.contracts';

import {TestFixtureProvider} from './test_fixture_provider';

/**
 * This class handles the creation of process instances and waits for a process instance to reach a user task.
 *
 * Only to be used in conjunction with the user task tests.
 */
export class ProcessInstanceHandler {

  private _testFixtureProvider: TestFixtureProvider;
  private _eventAggregator: IEventAggregator;

  constructor(testFixtureProvider: TestFixtureProvider) {
    this._testFixtureProvider = testFixtureProvider;
  }

  private get eventAggregator(): IEventAggregator {
    if (!this._eventAggregator) {
      this._eventAggregator = this.testFixtureProvider.resolve<IEventAggregator>('EventAggregator');
    }

    return this._eventAggregator;
  }

  private get testFixtureProvider(): TestFixtureProvider {
    return this._testFixtureProvider;
  }

  public async startProcessInstanceAndReturnCorrelationId(processModelId: string, correlationId?: string, inputValues?: any): Promise<string> {

    const startEventId: string = 'StartEvent_1';
    const startCallbackType: DataModels.ProcessModels.StartCallbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
    const payload: DataModels.ProcessModels.ProcessStartRequestPayload = {
      correlationId: correlationId || uuid.v4(),
      inputValues: inputValues || {},
    };

    const result: DataModels.ProcessModels.ProcessStartResponsePayload = await this.testFixtureProvider
      .consumerApiService
      .startProcessInstance(this.testFixtureProvider.identities.defaultUser, processModelId, payload, startCallbackType, startEventId);

    return result.correlationId;
  }

  public async startProcessInstanceAndReturnResult(
    processModelId: string,
    startEventId?: string,
    correlationId?: string,
    inputValues?: any,
    identity?: IIdentity,
  ): Promise<DataModels.ProcessModels.ProcessStartResponsePayload> {

    const startEventIdToUse: string = startEventId || 'StartEvent_1';
    const startCallbackType: DataModels.ProcessModels.StartCallbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
    const payload: DataModels.ProcessModels.ProcessStartRequestPayload = {
      correlationId: correlationId || uuid.v4(),
      inputValues: inputValues || {},
    };

    const identityToUse: IIdentity = identity || this.testFixtureProvider.identities.defaultUser;

    const result: DataModels.ProcessModels.ProcessStartResponsePayload = await this.testFixtureProvider
      .consumerApiService
      .startProcessInstance(identityToUse, processModelId, payload, startCallbackType, startEventIdToUse);

    return result;
  }

  public async waitForProcessInstanceToReachSuspendedTask(
    correlationId: string,
    processModelId?: string,
    expectedNumberOfWaitingTasks: number = 1,
  ): Promise<void> {

    const maxNumberOfRetries: number = 60;
    const delayBetweenRetriesInMs: number = 200;

    const flowNodeInstanceService: IFlowNodeInstanceService = this.testFixtureProvider.resolve<IFlowNodeInstanceService>('FlowNodeInstanceService');

    for (let i: number = 0; i < maxNumberOfRetries; i++) {

      await this.wait(delayBetweenRetriesInMs);

      let flowNodeInstances: Array<FlowNodeInstance> = await flowNodeInstanceService.querySuspendedByCorrelation(correlationId);

      if (processModelId) {
        flowNodeInstances = flowNodeInstances.filter((fni: FlowNodeInstance) => {
          return fni.tokens[0].processModelId === processModelId;
        });
      }

      const foundEnoughWaitingTasks: boolean = flowNodeInstances.length >= expectedNumberOfWaitingTasks;
      if (foundEnoughWaitingTasks) {
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
  public async getWaitingUserTasksForCorrelationId(identity: IIdentity, correlationId: string): Promise<DataModels.UserTasks.UserTaskList> {

    return this.testFixtureProvider
      .consumerApiService
      .getUserTasksForCorrelation(identity, correlationId);
  }

  /**
   * Returns all ManualTasks that are running with the given correlation id.
   *
   * @async
   * @param   identity      The identity with which to get the ManualTask.
   * @param   correlationId The ID of the Correlation for which to get the ManualTasks.
   * @returns               A list of waiting ManualTasks.
   */
  public async getWaitingManualTasksForCorrelationId(identity: IIdentity, correlationId: string): Promise<DataModels.ManualTasks.ManualTaskList> {

    return this.testFixtureProvider
      .consumerApiService
      .getManualTasksForCorrelation(identity, correlationId);
  }
  /**
   * Finishes a UserTask.
   *
   * @async
   * @param   identity           The identity with which to finish the UserTask.
   * @param   correlationId      The ID of the Correlation for which to finish
   *                             the UserTask.
   * @param   processInstanceId  The ID of the ProcessModel for which to finish
   *                             the UserTask.
   * @param   userTaskInstanceId The ID of the UserTask to finish.
   * @param   userTaskInput      The input data with which to finish the UserTask.
   * @returns                    The result of the finishing operation.
   */
  public async finishUserTaskInCorrelation(identity: IIdentity,
                                           correlationId: string,
                                           processInstanceId: string,
                                           userTaskInstanceId: string,
                                           userTaskInput: any): Promise<void> {

    await this.testFixtureProvider
      .consumerApiService
      .finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskInput);
  }

  /**
   * Finishes a ManualTask.
   *
   * @async
   * @param   identity           The identity with which to finish the ManualTask.
   * @param   correlationId      The ID of the Correlation for which to finish
   *                             the ManualTask.
   * @param   processInstanceId  The ID of the ProcessModel for which to finish
   *                             the ManualTask.
   * @param   manualTaskInstanceId The ID of the ManualTask to finish.
   * @param   manualTaskInput      The input data with which to finish the ManualTask.
   * @returns                    The result of the finishing operation.
   */
  public async finishManualTaskInCorrelation(identity: IIdentity,
                                             processModelId: string,
                                             correlationId: string,
                                             manualTaskId: string): Promise<void> {

    await this.testFixtureProvider
      .consumerApiService
      .finishManualTask(identity, processModelId, correlationId, manualTaskId);
  }

  /**
   * There is a gap between the finishing of ManualTasks/UserTasks and the end
   * of the ProcessInstance.
   * Mocha resolves and disassembles the backend BEFORE the process was finished,
   * which leads to inconsistent database entries.
   * To avoid a messed up database that could break other tests, we must wait for
   * each ProcessInstance to finishe before progressing.
   *
   * @param correlationId  The correlation in which the process runs.
   * @param processModelId The id of the process model to wait for.
   * @param resolveFunc    The function to call when the process was finished.
   */
  public waitForProcessInstanceToEnd(correlationId: string, processModelId: string, resolveFunc: EventReceivedCallback): void {
    const endMessageToWaitFor: string = `/processengine/correlation/${correlationId}/processmodel/${processModelId}/ended`;
    this.eventAggregator.subscribeOnce(endMessageToWaitFor, resolveFunc);
  }

  public waitForProcessWithInstanceIdToEnd(processInstanceId: string, resolveFunc: EventReceivedCallback): void {
    const endMessageToWaitFor: string = `/processengine/process/${processInstanceId}/ended`;
    this.eventAggregator.subscribeOnce(endMessageToWaitFor, resolveFunc);
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
