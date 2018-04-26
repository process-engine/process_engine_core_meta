const should = require("should")
const TestFixtureProvider = require("../dist/commonjs/test_fixture_provider").TestFixtureProvider

describe("A script before the xor split returns a value. The XOR - Split should evaluate this value and direct the token the right path.", async () => {
    let tfp;

    before(async () => {
        tfp = new TestFixtureProvider()
        await tfp.initializeAndStart()
    })

    it("should evaluate the current token value correct and direct the token the right path", async () => {
        //ID of the process
        const processId = "xor_eval_script_result"

        //Expected Token Object
        const expectedResult = {
            current: 2,
            history: {
                "StartEvent_1": {},
                "Task1": 1,
                "XORSplit1": 1,
                "Task2": 2,
                "XORJoin1": 2
            }
        }

        //Execute the process
        const result = await tfp.executeProcess(processId)

        //Compare the Token
        result.should.be.eql(expectedResult)
    })

    after(async () => {
        await tfp.tearDown()
    })
})