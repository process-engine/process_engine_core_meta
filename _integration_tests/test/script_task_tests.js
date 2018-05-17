'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Tasks - ', () => {
  let testFixtureProvider;

  // Every test case uses the same process.
  const processKey = 'script_task_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();

    const processDefFiles = ['script_task_test.bpmn'];
    await testFixtureProvider.loadProcessesFromBPMNFiles(processDefFiles);

  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute different script tasks that access the token history and return different values', async () => {

    // Initial token object
    const initialToken = {
      test_type: 'basic_test',
    };

    // Object that should be returned from one script task.
    const simpleObject = {
      prop1: 1337,
      prop2: 'Hello',
    };

    // Expected Token object
    const expectedToken = {
      current: simpleObject,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        BTTask1: 1,
        BTTask2: 2,
        BTTask3: 2,
        BTTask4: simpleObject,
        XORJoin1: simpleObject,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    should(result).be.eql(expectedToken);

  });

  it('should throw an error when trying to execute a faulty script task', async () => {

    // Initial token object
    const initialToken = {
      test_type: 'faulty_task',
    };

    // Regular Expression that should matched by the error message.
    const expectedMessage = /a.*?not.*?defined/i;

    // Execute the process with the faulty script task and see, if the process is sucessfully rejected.
    await testFixtureProvider.executeProcess(processKey, initialToken).should.be.rejectedWith(expectedMessage);
  });

  it('should throw an expected error, thrown by the script task', async () => {
    // Initial token object
    const initialToken = {
      test_type: 'throw_exception',
    };

    const expectedMessage = /Failed/i;

    // Execute the process and see, if the exception is throw and if the promise is rejected
    await testFixtureProvider.executeProcess(processKey, initialToken).should.be.rejectedWith(expectedMessage);
  });
});
