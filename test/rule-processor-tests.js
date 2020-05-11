const should = require('should');
const _ = require('the-lodash');
const FileUtils = require('./utils/file-utils');
const RuleProcessor = require('../lib/processors/rule/processor');
const RegistryState = require('kubevious-helpers/lib/registry-state');

describe('rule-processor-tests', function() {

    setupTest('logic-item-01', 'logic-image-02', 
        (result) => {
            // console.log(result)
        }, 
        (result) => {
            // console.log(result.success)
            // console.log(result.ruleItems)

        });

  /*****/

  function setupTest(targetName, validatorName, validatePrepareCb, validateExecuteCb, debugOutputObjects)
  {

    it(targetName + '_' + validatorName, function() {

        var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
        var state = new RegistryState(null, snapshotInfo);
  
        var targetScript = FileUtils.readFile('target/' + targetName + '.js');

        var validatorScript = FileUtils.readFile('validator/' + validatorName + '/validator.js');
        
        var processor = new RuleProcessor(state, {
            target: targetScript,
            script: validatorScript
        });
        return processor.prepare()
            .then(result => {
                // console.log("POST PREPARE:");
                // console.log(result);

                if (validatePrepareCb) {
                    validatePrepareCb(result);
                }
                // (result).should.be.an.Object();
                // (result.success).should.be.true();
                // (result.messages).should.be.empty();
                return processor.execute();
            })
            .then(result => {
                // console.log("POST EXECUTE:");
                // console.log(result);

                if (validateExecuteCb) {
                    validateExecuteCb(result);
                }

            });

    });    

  }  
  
});