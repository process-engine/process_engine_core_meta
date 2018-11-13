'use strict';

const uuid = require('uuid');
const should = require('should');

const TestFixtureProvider = require('../dist/commonjs').TestFixtureProvider;
const ProcessInstanceHandler = require('../dist/commonjs').ProcessInstanceHandler;

describe('User Tasks - ', () => {

  let processInstanceHandler;
  let testFixtureProvider;

  let identity;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
    identity = testFixtureProvider.identities.defaultUser;

    const processDefinitionFiles = [
      'user_task_test',
      'user_task_expression_test',
      'user_task_sequential_test',
      'user_task_parallel_test',
    ];
    await testFixtureProvider.importProcessFiles(processDefinitionFiles);

    processInstanceHandler = new ProcessInstanceHandler(testFixtureProvider);
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should evaluate expressions in user task form fields.', async () => {

    const processModelId = 'user_task_expression_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    const waitingUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    const expectedNumberOfWaitingUserTasks = 1;

    should(waitingUserTasks.userTasks.length).be.equal(expectedNumberOfWaitingUserTasks);

    const expectedLabelValue = 1;
    const expectedDefaultValue = 2;

    const userTask = waitingUserTasks.userTasks[0];

    const waitingUserTaskFieldLabel = userTask.data.formFields[0].label;
    const waitingUserTaskFieldDefaultValue = userTask.data.formFields[0].defaultValue;

    should(waitingUserTaskFieldLabel).be.equal(expectedLabelValue);
    should(waitingUserTaskFieldDefaultValue).be.equal(expectedDefaultValue);

    await processInstanceHandler.finishUserTaskInCorrelation(identity, correlationId, userTask.processInstanceId, userTask.flowNodeInstanceId, {});
  });

  it('should finish the user task.', async () => {

    const processModelId = 'user_task_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    const waitingUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(waitingUserTasks.userTasks).be.instanceOf(Array);
    should(waitingUserTasks.userTasks.length).be.greaterThan(0);

    const userTask = waitingUserTasks.userTasks[0];

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    await processInstanceHandler
      .finishUserTaskInCorrelation(identity, correlationId, userTask.processInstanceId, userTask.flowNodeInstanceId, userTaskInput);
  });

  it('should finish two sequential user tasks', async () => {

    const processModelId = 'user_task_sequential_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    let waitingUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(waitingUserTasks.userTasks).be.instanceOf(Array);
    should(waitingUserTasks.userTasks.length).be.greaterThan(0);

    const userTask1 = waitingUserTasks.userTasks[0];

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    await processInstanceHandler
      .finishUserTaskInCorrelation(identity, correlationId, userTask1.processInstanceId, userTask1.flowNodeInstanceId, userTaskInput);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    waitingUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(waitingUserTasks.userTasks).be.instanceOf(Array);
    should(waitingUserTasks.userTasks.length).be.greaterThan(0);

    const userTask2 = waitingUserTasks.userTasks[0];

    await processInstanceHandler
      .finishUserTaskInCorrelation(identity, correlationId, userTask2.processInstanceId, userTask2.flowNodeInstanceId, userTaskInput);
  });

  it('should finish two parallel running user tasks', async () => {

    const processModelId = 'user_task_parallel_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    const currentRunningUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(currentRunningUserTasks).have.property('userTasks');
    should(currentRunningUserTasks.userTasks).have.size(2, 'There should be two waiting user tasks');

    const waitingUsersTasks = currentRunningUserTasks.userTasks;

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    for (const currentWaitingUserTask of waitingUsersTasks) {

      await testFixtureProvider
        .consumerApiService
        .finishUserTask(identity, currentWaitingUserTask.processInstanceId, correlationId, currentWaitingUserTask.flowNodeInstanceId, userTaskInput);
    }
  });

  it('should fail to finish a user task which is not in a waiting state', async () => {

    const processModelId = 'user_task_sequential_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorObjectProperties = [
      'name',
      'code',
      'message',
    ];

    const errorName = /.*not.*found/i;
    const errorMessage = /.*User_Task_2.*/i;
    const errorCode = 404;

    try {
      // Try to finish the user task which is currently not waiting
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(identity, processModelId, correlationId, 'User_Task_2', userTaskInput);
    } catch (error) {
      should(error).have.properties(...errorObjectProperties);

      should(error.name).be.match(errorName);
      should(error.code).be.equal(errorCode);
      should(error.message).be.match(errorMessage);
    }
  });

  it('should refuse to finish a user task twice', async () => {

    const processModelId = 'user_task_sequential_test';
    const correlationId = uuid.v4();
    const initialToken = {
      inputValues: {},
    };

    await processInstanceHandler.startProcessInstanceAndReturnCorrelationId(processModelId, correlationId, initialToken);
    await processInstanceHandler.waitForProcessInstanceToReachSuspendedTask(correlationId);

    const waitingUserTasks = await processInstanceHandler.getWaitingUserTasksForCorrelationId(identity, correlationId);

    should(waitingUserTasks.userTasks).be.instanceOf(Array);
    should(waitingUserTasks.userTasks.length).be.greaterThan(0);

    const userTask = waitingUserTasks.userTasks[0];

    const userTaskInput = {
      formFields: {
        Sample_Form_Field: 'Hello',
      },
    };

    const errorObjectProperties = [
      'name',
      'code',
      'message',
    ];

    const errorMessage = /does not have a usertask/i;
    const errorCode = 404;

    await testFixtureProvider
      .consumerApiService
      .finishUserTask(identity, userTask.processInstanceId, correlationId, userTask.flowNodeInstanceId, userTaskInput);

    try {
      await testFixtureProvider
        .consumerApiService
        .finishUserTask(identity, userTask.processInstanceId, correlationId, userTask.flowNodeInstanceId, userTaskInput);
    } catch (error) {
      should(error).have.properties(...errorObjectProperties);

      should(error.code).be.equal(errorCode);
      should(error.message).be.match(errorMessage);
    }
  });
});
