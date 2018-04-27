const should = require("should");
const TestFixtureProvider = require("../dist/commonjs/test_fixture_provider").TestFixtureProvider

describe.only("Script Task - Access current Token value", () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown();
  })

  it("should read the current token value and increment it.", async () => {

    const processKey = "script_task_current_token_test";

    //The expected token object
    const expectedToken = {
      current: 2,
      history: {
        StartEvent_1: {},
        Task1: 1,
        Task2: 2
      }
    };

    //Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    //Compare the results
    result.should.be.eql(expectedToken);
  });
});
