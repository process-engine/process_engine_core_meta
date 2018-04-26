const should = require("should")
const TestFixtureProvider = require("../dist/commonjs/test_fixture_provider").TestFixtureProvider

describe("Simple Test of a xor gateway. The Token should take the Path with the matching condition (there is simply one true and one false path in this test)", () => {
    let tfp;

    /**
     * Initialize the test.
     */
    before(async () => {
        tfp = new TestFixtureProvider()
        await tfp.initializeAndStart()
    })

    it("should return the correct value for the right path.", async () => {

        //The ID of the test process
        const processId = "simple_xor_gateway_test"

        //Content of the token, that should returned by the end of the process execution.
        const expectedToken = {
            "current": 1,
            "history": {
                "StartEvent_1": {},
                "XORSplit1": {},
                "Task1": 1,
                "XORJoin1": 1
            }
        }

        //Execute the process
        const result = await tfp.executeProcess(processId)

        //Compare the results
        result.should.be.eql(expectedToken)

    })

    /**
     * Clean up after running the test
     */
    after(async () => {
        await tfp.tearDown()
    })

})