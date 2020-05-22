const should = require('should');
const _ = require('the-lodash');
const FileUtils = require('./utils/file-utils');
const RuleProcessor = require('../').RuleProcessor;
const RegistryState = require('kubevious-helpers').RegistryState;

describe('rule-processor-tests', function() {

    setupTest(
        'logic-item-01',
        'logic-image-01', 
        (result) => {

            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(12);

            for(var x of _.values(result.ruleItems))
            {
                should(x.hasError).be.true();
                should(x.hasWarning).be.false();
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
                should(x.hasError).be.true();
                should(x.hasWarning).be.false();
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
                should(x.hasError).be.false();
                should(x.hasWarning).be.true();
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
                should(x.hasError).be.false();
                should(x.hasWarning).be.false();

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
                should(x.hasError).be.false();
                should(x.hasWarning).be.false();

                (x.marks).should.be.Object();
                (x.marks['cool']).should.be.true();
                (x.marks['new']).should.be.true();
                (_.keys(x.marks).length).should.be.equal(2);
            }
        });
  /*****/

  function setupTest(targetName, validatorName, validateCb, debugOutputObjects)
  {

    it(targetName + '_' + validatorName, function() {

        var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
        var state = new RegistryState(snapshotInfo);
  
        var targetScript = FileUtils.readFile('target/' + targetName + '.js');

        var validatorScript = FileUtils.readFile('validator/' + validatorName + '/validator.js');
        
        var processor = new RuleProcessor(state, {
            target: targetScript,
            script: validatorScript
        });
        return processor.process()
            .then(result => {

                (result).should.be.an.Object();
                if (!result.success) {
                    console.log(result);
                }
                (result.success).should.be.true();
                (result.messages).should.be.empty();
    
                if (validateCb) {
                    validateCb(result);
                }

            });

    });    

  }  
  
});