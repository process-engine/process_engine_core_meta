const should = require('should');
const TestFixtureProvider = require('../dist/commonjs/test_fixture_provider').TestFixtureProvider;

describe('Exclusive Gateway - Nested Branches', () => {
    let testFixtureprovider;

    before(async () => {
        testFixtureprovider = new TestFixtureProvider();
        await testFixtureprovider.initializeAndStart();
    })

    it('should returns the right token value.', async () => {
        //Id of the process
        const processModelKey = 'nested_xor';

        //Expected Token Result
        const expectedToken = {
            'current' : 4,
            'history': {
                'StartEvent_1': {},
                'Task1': 1, 
                'XORSplit1': 1,
                'Task2': 2,
                'XORSplit2': 2,
                'Task4': 3,
                'XORJoin2': 3,
                'Task6': 4,
                'XORJoin1': 4 
            }
        };

        //Execute the process and store the token
        const result = await testFixtureprovider.executeProcess(processModelKey);

        //Compare the results
        result.should.be.eql(expectedToken);
    })

    after(async () => {
        await testFixtureprovider.tearDown();
    })

})