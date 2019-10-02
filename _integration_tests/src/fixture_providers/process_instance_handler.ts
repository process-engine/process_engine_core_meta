import * as uuid from 'node-uuid';

import {EventReceivedCallback, IEventAggregator} from '@essential-projects/event_aggregator_contracts';
import {IIdentity} from '@essential-projects/iam_contracts';

import {DataModels} from '@process-engine/consumer_api_contracts';

import {FlowNodeInstance, IFlowNodeInstanceService} from '@process-engine/persistence_api.contracts';

import {TestFixtureProvider} from './test_fixture_provider';

/**
 * This class handles the creation of process instances and waits for a process instance to reach a user task.
 *
 * Only to be used in conjunction with the user task tests.
 */
export class ProcessInstanceHandler {

  private testFixtureProvider: TestFixtureProvider;
  private eventAggregator: IEventAggregator;

  constructor(testFixtureProvider: TestFixtureProvider) {
    this.testFixtureProvider = testFixtureProvider;
    this.eventAggregator = this.testFixtureProvider.resolve<IEventAggregator>('EventAggregator');
  }

  public async startProcessInstanceAndReturnCorrelationId(processModelId: string, correlationId?: string, inputValues?: any): Promise<string> {

    const startEventId = 'StartEvent_1';
    const startCallbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
    const payload = {
      correlationId: correlationId || uuid.v4(),
      inputValues: inputValues || {},
    };

    const result = await this.testFixtureProvider
      .consumerApiClient
      .startProcessInstance(this.testFixtureProvider.identities.defaultUser, processModelId, payload, startCallbackType, startEventId);

    return result.correlationId;
  }

  public async startProcessInstanceAndReturnResult(
    processModelId: string,
    correlationId?: string,
    inputValues?: any,
    identity?: IIdentity,
  ): Promise<DataModels.ProcessModels.ProcessStartResponsePayload> {

    const startEventIdToUse = 'StartEvent_1';
    const startCallbackType = DataModels.ProcessModels.StartCallbackType.CallbackOnProcessInstanceCreated;
    const payload = {
      correlationId: correlationId || uuid.v4(),
      inputValues: inputValues || {},
    };

    const identityToUse = identity || this.testFixtureProvider.identities.defaultUser;

    const result = await this.testFixtureProvider
      .consumerApiClient
      .startProcessInstance(identityToUse, processModelId, payload, startCallbackType, startEventIdToUse);

    return result;
  }

  public async waitForProcessInstanceToReachSuspendedTask(
    correlationId: string,
    processModelId?: string,
    expectedNumberOfWaitingTasks: number = 1,
  ): Promise<void> {

    const maxNumberOfRetries = 60;
    const delayBetweenRetriesInMs = 200;

    const flowNodeInstanceService = this.testFixtureProvider.resolve<IFlowNodeInstanceService>('FlowNodeInstanceService');

    for (let i = 0; i < maxNumberOfRetries; i++) {

      await this.wait(delayBetweenRetriesInMs);

      let flowNodeInstances = await flowNodeInstanceService.querySuspendedByCorrelation(correlationId);

      if (processModelId) {
        flowNodeInstances = flowNodeInstances.filter((fni: FlowNodeInstance): boolean => {
          return fni.tokens[0].processModelId === processModelId;
        });
      }

      const foundEnoughWaitingTasks = flowNodeInstances.length >= expectedNumberOfWaitingTasks;
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
   * @param   identity      The identity with which to get the EmptyActivity.
   * @param   correlationId The ID of the Correlation for which to get the EmptyActivities.
   * @returns               A list of waiting EmptyActivities.
   */
  public async getWaitingEmptyActivitiesForCorrelationId(
    identity: IIdentity,
    correlationId: string,
  ): Promise<DataModels.EmptyActivities.EmptyActivityList> {

    return this.testFixtureProvider
      .consumerApiClient
      .getEmptyActivitiesForCorrelation(identity, correlationId);
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
      .consumerApiClient
      .getManualTasksForCorrelation(identity, correlationId);
  }

  /**
   * Returns all user tasks that are running within the correlation with the given id.
   *
   * @async
   * @param   identity      The identity with which to get the UserTask.
   * @param   correlationId The ID of the Correlation for which to get the UserTasks.
   * @returns               A list of waiting UserTasks.
   */
  public async getWaitingUserTasksForCorrelationId(identity: IIdentity, correlationId: string): Promise<DataModels.UserTasks.UserTaskList> {

    return this.testFixtureProvider
      .consumerApiClient
      .getUserTasksForCorrelation(identity, correlationId);
  }

  /**
   * Finishes an EmptyActivity.
   *
   * @async
   * @param   identity           The identity with which to finish the EmptyActivity.
   * @param   correlationId      The ID of the Correlation for which to finish
   *                             the EmptyActivity.
   * @param   processInstanceId  The ID of the ProcessModel for which to finish
   *                             the EmptyActivity.
   * @param   flowNodeInstanceID The ID of the EmptyActivity to finish.
   * @returns                    The result of the finishing operation.
   */
  public async finishEmptyActivityInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
    manualTaskId: string,
  ): Promise<void> {

    await this.testFixtureProvider
      .consumerApiClient
      .finishEmptyActivity(identity, processModelId, correlationId, manualTaskId);
  }

  /**
   * Finishes a ManualTask.
   *
   * @async
   * @param   identity             The identity with which to finish the ManualTask.
   * @param   correlationId        The ID of the Correlation for which to finish
   *                               the ManualTask.
   * @param   processInstanceId    The ID of the ProcessModel for which to finish
   *                               the ManualTask.
   * @param   manualTaskInstanceId The ID of the ManualTask to finish.
   * @returns                      The result of the finishing operation.
   */
  public async finishManualTaskInCorrelation(
    identity: IIdentity,
    processModelId: string,
    correlationId: string,
    manualTaskId: string,
  ): Promise<void> {

    await this.testFixtureProvider
      .consumerApiClient
      .finishManualTask(identity, processModelId, correlationId, manualTaskId);
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
  public async finishUserTaskInCorrelation(
    identity: IIdentity,
    correlationId: string,
    processInstanceId: string,
    userTaskInstanceId: string,
    userTaskInput: any,
  ): Promise<void> {

    await this.testFixtureProvider
      .consumerApiClient
      .finishUserTask(identity, processInstanceId, correlationId, userTaskInstanceId, userTaskInput);
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
    const endMessageToWaitFor = `/processengine/correlation/${correlationId}/processmodel/${processModelId}/ended`;
    this.eventAggregator.subscribeOnce(endMessageToWaitFor, resolveFunc);
  }

  public waitForProcessWithInstanceIdToEnd(processInstanceId: string, resolveFunc: EventReceivedCallback): void {
    const endMessageToWaitFor = `/processengine/process/${processInstanceId}/ended`;
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
      setTimeout((): void => {
        resolve();
      }, delayTimeInMs);
    });
  }

}
