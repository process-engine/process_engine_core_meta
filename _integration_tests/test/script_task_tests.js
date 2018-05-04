'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Script Task', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should execute a process with five chained script tasks.', async () => {

    // Key of the process
    const processKey = 'script_task_basic_test';

    // Expected Token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: 2,
        Task3: 3,
        Task4: {
          prop1: 1337,
          prop2: 'Hello World',
        },
        Task5: 2,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Check the token object
    result.should.be.eql(expectedToken);
  });

  it('should reject the promise, when trying to execute the faulty script task', async () => {
    const processKey = 'script_task_invalid_script';

    // Regular Expression that should matched by the error message.
    const expectedMessage = /a.*?not.*?defined/i;

    // Execute the process with the faulty script task and see, if the process is sucessfully rejected.
    await testFixtureProvider.executeProcess(processKey).should.be.rejectedWith(expectedMessage);
  });

  it('should throw an exception', async () => {
    const processKey = 'script_task_throws_exception';

    const expectedMessage = /Failed/i;

    // Execute the process and see, if the exception is throw and if the promise is rejected
    await testFixtureProvider.executeProcess(processKey).should.be.rejectedWith(expectedMessage);
  });
});
