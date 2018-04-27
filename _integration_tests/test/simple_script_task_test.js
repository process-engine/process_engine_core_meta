const should = require("should")
const TestFixtureProvider = require("../dist/commonjs/test_fixture_provider").TestFixtureProvider

describe.only("Script Task - Return Value", () => {
  let testFixtureProvider;

  before(async () => {
    testFixtureProvider = new TestFixtureProvider();
    await testFixtureProvider.initializeAndStart();
  });

  after(async () => {
    await testFixtureProvider.tearDown()
  });

  it("should run a script, that simply returns the value 1.", async () => {
    
    //Key of the process
    const processKey = "simple_script_task_test";

    //Expected Token
    const expectedToken = {
      "current": 1,
      "history": {
        "StartEvent_1": {},
        "Task1": 1,
      }
    };

    //Execute the process
    const result = await testFixtureProvider.executeProcess(processKey);

    //Check the result
    result.should.be.eql(expectedToken)
  });
});
