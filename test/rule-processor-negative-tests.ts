import should from 'should'
import _ from 'the-lodash'
import 'mocha'

import { readRegistryState, readJsonData, readFile } from './utils/file-utils'
import { RuleProcessor } from '../src/processors/rule/processor'

describe('rule-processor-negative-tests', function () {
    setupTest(
        'target/logic-item-01',
        'invalid-validators/logic-image-01',
        (result) => {
            result.should.be.an.Object()
            result.success.should.be.false()
            result.messages.should.not.be.empty()

            result.messages.length.should.be.equal(1)
            result.messages[0].should.be.eql({
                source: ['script'],
                msg: "Cannot read property 'config' of undefined",
            })
        }
    )

    setupTest(
        'invalid-target/error-01',
        'validator/logic-image-01',
        (result) => {
            result.should.be.an.Object()
            result.success.should.be.false()
            result.messages.should.not.be.empty()

            result.messages.length.should.be.equal(1)
            result.messages[0].should.be.eql({
                source: ['target'],
                msg: 'abcd is not defined',
            })
        }
    )

    /*****/

    function setupTest(
        targetName: string,
        validatorName: string,
        validateCb: (cb: any) => void
    ) {
        it(targetName + '_' + validatorName, function () {
            var state = readRegistryState('snapshot-items.json');

            var targetScript = readFile(targetName + '.js')

            var validatorScript = readFile(validatorName + '/validator.js')

            var processor = new RuleProcessor(state, {
                target: targetScript,
                script: validatorScript,
            })

            return processor.process().then((result) => {
                if (validateCb) {
                    validateCb(result)
                }
            })
        })
    }
})
