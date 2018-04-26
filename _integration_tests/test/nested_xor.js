const should = require("should")

const TestFixtureProvider = require("../dist/commonjs/test_fixture_provider").TestFixtureProvider

describe("Here, the token discovers two different branches, which are nested.", () => {

    let tfp;

    before(async () => {
        tfp = new TestFixtureProvider()
        await tfp.initializeAndStart()
    })

    it("should returns the right token value.", async () => {
        //Id of the process
        const processId = "nested_xor"

        //Expected Token Result
        const expectedToken = {
            "current" : 4,
            "history": {
                "StartEvent_1": {},
                "Task1": 1, 
                "XORSplit1": 1,
                "Task2": 2,
                "XORSplit2": 2,
                "Task4": 3,
                "XORJoin2": 3,
                "Task6": 4,
                "XORJoin1": 4 
            }
        }

        //Execute the process and store the token
        const result = await tfp.executeProcess(processId)

        //Compare the results
        result.should.be.eql(expectedToken)
    })

    after(async () => {
        await tfp.tearDown()
    })

})