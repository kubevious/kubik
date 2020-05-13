const should = require('should');
const _ = require('the-lodash');
const FileUtils = require('./utils/file-utils');
const RuleProcessor = require('../').RuleProcessor;
const RegistryState = require('kubevious-helpers').RegistryState;

describe('rule-processor-tests', function() {

    setupTest(
        'logic-item-01',
        'logic-image-02', 
        (result) => {

            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(12);

            for(var x of _.values(result.ruleItems))
            {
            (x.hasError).should.be.true();
            }

        });


    setupTest(
        'logic-item-filter-03',
        'logic-image-02', 
        (result) => {

            (result.ruleItems).should.be.an.Object();
            (_.keys(result.ruleItems).length).should.be.equal(2);

            for(var x of _.values(result.ruleItems))
            {
            (x.hasError).should.be.true();
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
                (result.success).should.be.true();
                (result.messages).should.be.empty();
    
                if (validateCb) {
                    validateCb(result);
                }

            });

    });    

  }  
  
});