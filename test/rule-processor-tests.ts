import 'mocha';
import should from 'should';
import _ from 'the-lodash';

import { readRegistryState, readFile, readJsonData} from './utils/file-utils';
import { ExecuteResult, RuleProcessor } from '../src';

describe('rule-processor-tests', function() {

    setupTest(
        'logic-item-01',
        'logic-image-01',
        (result) => {

            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(23);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).be.ok();
                should(x.errors.present).be.true();
                should(x.errors.messages.length).be.equal(0);
                should(x.warnings).not.be.ok();
                (x.marks).should.be.Object();
                (_.keys(x.marks).length).should.be.equal(0);
            }

        });


    setupTest(
        'logic-item-filter-03',
        'logic-image-01',
        (result) => {

            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(2);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).be.ok();
                should(x.errors.present).be.true();
                should(x.errors.messages.length).be.equal(0);
                should(x.warnings).not.be.ok();
                (x.marks).should.be.Object();
                (_.keys(x.marks).length).should.be.equal(0);
            }

        });

    setupTest(
        'logic-item-filter-03',
        'logic-warn',
        (result) => {
            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(13);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).not.be.ok();
                should(x.warnings).be.ok();
                should(x.warnings.present).be.true();
                should(x.warnings.messages.length).be.equal(0);
                (x.marks).should.be.Object();
                (_.keys(x.marks).length).should.be.equal(0);
            }
        });

    setupTest(
        'logic-item-01',
        'logic-error-msg',
        (result) => {
            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(130);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).be.ok();
                should(x.errors.present).be.true();
                should(x.errors.messages.length).be.equal(1);
                should(x.errors.messages[0]).be.equal("My Custom Warning");

                should(x.warnings).not.be.ok();

                (x.marks).should.be.Object();
                (_.keys(x.marks).length).should.be.equal(0);
            }
        });

    setupTest(
        'logic-item-01',
        'logic-warn-msg',
        (result) => {
            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(130);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).not.be.ok();

                should(x.warnings).be.ok();
                should(x.warnings.present).be.true();
                should(x.warnings.messages.length).be.equal(1);
                should(x.warnings.messages[0]).be.equal("this is My custom Warning");

                (x.marks).should.be.Object();
                (_.keys(x.marks).length).should.be.equal(0);
            }
        });

    setupTest(
        'logic-item-filter-01',
        'logic-marker',
        (result) => {
            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(34);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).not.be.ok();
                should(x.warnings).not.be.ok();

                (x.marks).should.be.Object();
                (x.marks['cool']).should.be.true();
                (_.keys(x.marks).length).should.be.equal(1);
            }
        });

    setupTest(
        'logic-item-filter-04',
        'logic-marker',
        (result) => {
            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(1);

            for(var x of _.values(result.ruleItems))
            {
                should(x.errors).not.be.ok();
                should(x.warnings).not.be.ok();

                (x.marks).should.be.Object();
                (x.marks['cool']).should.be.true();
                (x.marks['new']).should.be.true();
                (_.keys(x.marks).length).should.be.equal(2);
            }
        });
  /*****/

  function setupTest(targetName: string, validatorName: string, validateCb: (cb: ExecuteResult) => void)
  {

    it(targetName + '_' + validatorName, function() {

        var state = readRegistryState('snapshot-items.json');

        var targetScript = readFile('target/' + targetName + '.js');

        var validatorScript = readFile('validator/' + validatorName + '/validator.js');
        var processor = new RuleProcessor(state, {
            target: targetScript,
            script: validatorScript
        });
        return processor.process()
            .then((result: ExecuteResult) => {

                should(result).be.an.Object();
                if (!result!.success!) {
                    console.log(result);
                }
                should(result.success).be.true();
                should(result.messages).be.empty();

                if (validateCb) {
                    validateCb(result);
                }

            });

    });

  }

});
