'use strict';
const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Service Task - ', () => {
  let testFixtureProvider;

  // Every test uses the same process key.
  const processKey = 'service_task_test';

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  });

  it('should return the values which is provided by the test service', async () => {

    // Initial token object
    const initialToken = {
      test_type: 'basic_test',
    };

    const simpleObject = {
      prop1: 1337,
      prop2: 'Hello World',
    };

    // The exptected token object should looks like this
    const exptectedToken = {
      current: simpleObject,
      history: {
        StartEvent_1: initialToken,
        XORSplit1: initialToken,
        BTTask1: 1,
        BTTask2: simpleObject,
        BTTask3: simpleObject,
        XORJoin1: simpleObject,
      },
    };

    // Execute the process
    const result = await testFixtureProvider.executeProcess(processKey, initialToken);

    result.should.be.eql(exptectedToken);
  });

  it('should throw an error', async () => {

    // Initial token object
    const initialToken = {
      test_type: 'throw_exception',
    };

    // Expected exception content
    const expectedExceptionContent = /Failed/i;

    await testFixtureProvider.executeProcess(processKey, initialToken).should.be.rejectedWith(expectedExceptionContent);
  });
});
