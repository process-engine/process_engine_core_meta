'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Service Task - Simple Service Task', () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should returns the value, which the test service provides.', async () => {

    const processKey = 'service_task_basic_test';

    // The exptected token object should looks like this
    const exptectedToken = {
      current: 5,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: {
          prop1: 1337,
          prop2: 'Hello World',
        },
        Task3: 1,
        Task4: 5,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    // Compare the results
    result.should.be.eql(exptectedToken);
  });

  it('should throw an exception.', async () => {

    const processKey = 'service_task_exception_test';

    // Expected exception content
    const expectedExceptionContent = RegExp('Failed.*');

    // Check, if the exception is thrown and the promise is rejected.
    await testFixtureProvider.executeProcess(processKey).should.be.rejectedWith(expectedExceptionContent);
  });
});
