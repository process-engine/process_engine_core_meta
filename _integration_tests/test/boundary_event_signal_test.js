'use strict';

const uuid = require('node-uuid');
const should = require('should');

const {ProcessInstanceHandler, TestFixtureProvider} = require('../dist/commonjs');

describe('Signal Boundary Event - ', () => {

  let eventAggregator;
  let processInstanceHandler;

  let defaultIdentity;
  let testFixtureProvider;

  const processModelId = 'boundary_event_signal_test';
  const startEventId = 'StartEvent_1';
  const correlationId = uuid.v4();

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    defaultIdentity = testFixtureProvider.identities.defaultUser;

    eventAggregator = await testFixtureProvider.resolveAsync('EventAggregator');
    processInstanceHandler = new ProcessInstanceHandler(testFixtureProvider);
    await testFixtureProvider.importProcessFiles([processModelId]);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should interrupt the task when a signal arrives at an interrupting BoundaryEvent', async () => {

    const expectedResult = /signal received/i;

    testFixtureProvider.executeProcess(processModelId, startEventId, correlationId);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId, processModelId);

    await new Promise((resolve) => {

      const onProcessFinishedCallback = (signal) => {
        should(signal.currentToken).be.match(expectedResult);
        resolve();
      };

      processInstanceHandler.waitForProcessInstanceToEnd(correlationId, processModelId, onProcessFinishedCallback);

      const triggerSignalEventName = '/processengine/process/signal/Signal1234';
      eventAggregator.publish(triggerSignalEventName, {});
    });
  });

  it('should no longer list the task as active, after it was interrupted', async () => {

    const userTaskList = await testFixtureProvider
      .consumerApiClient
      .getUserTasksForProcessModelInCorrelation(defaultIdentity, processModelId, correlationId);

    should(userTaskList.userTasks).be.an.Array();
    should(userTaskList.userTasks).be.length(0, 'The UserTask was not interrupted properly!');
  });

  it('should not interrupt the task when a message arrives at a non-interrupting BoundaryEvent', async () => {

    const startEventId2 = 'StartEvent_2';
    testFixtureProvider.executeProcess(processModelId, startEventId2, correlationId);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId, processModelId);

    await new Promise(async (resolve) => {

      processInstanceHandler.waitForProcessInstanceToEnd(correlationId, processModelId, resolve);

      const triggerMessageEventName = '/processengine/process/signal/Signal1234';
      eventAggregator.publish(triggerMessageEventName, {});

      await new Promise((cb) => { setTimeout(cb, 1000); });

      const userTaskList = await testFixtureProvider
        .consumerApiClient
        .getUserTasksForProcessModelInCorrelation(defaultIdentity, processModelId, correlationId);

      should(userTaskList.userTasks).be.an.Array();
      should(userTaskList.userTasks.length).be.greaterThan(0, 'The UserTask was interrupted!');

      const userTask = userTaskList.userTasks[0];

      await testFixtureProvider
        .consumerApiClient
        .finishUserTask(defaultIdentity, userTask.processInstanceId, userTask.correlationId, userTask.flowNodeInstanceId, {});
    });
  });
});
