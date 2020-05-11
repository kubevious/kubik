const should = require('should');
const _ = require('the-lodash');
const FileUtils = require('./utils/file-utils');
const RuleProcessor = require('../lib/processors/rule/processor');
const RegistryState = require('kubevious-helpers/lib/registry-state');

describe('rule-processor-negative-tests', function() {

    setupTest(
        'target/logic-item-01',
        'invalid-validators/logic-image-01', 
        (result) => {
            (result).should.be.an.Object();
            (result.success).should.be.true();
            (result.messages).should.be.empty();
        }, 
        (result) => {
            // console.log(result);
            (result).should.be.an.Object();
            (result.success).should.be.false();
            (result.messages).should.not.be.empty();
            (result.messages.length).should.be.equal(1);
        });

    setupTest(
        'invalid-target/error-01',
        'validator/logic-image-01', 
        (result) => {
            // console.log(result);
            (result).should.be.an.Object();
            (result.success).should.be.false();
            (result.messages).should.not.be.empty();
            (result.messages.length).should.be.equal(2);
        }, 
        (result) => {
            (result).should.be.an.Object();
            (result.success).should.be.false();
            (result.messages).should.not.be.empty();
            console.log(result.messages);
            (result.messages.length).should.be.equal(1);
        });        

  /*****/

  function setupTest(targetName, validatorName, validatePrepareCb, validateExecuteCb, debugOutputObjects)
  {

    it(targetName + '_' + validatorName, function() {

        var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
        var state = new RegistryState(null, snapshotInfo);
  
        var targetScript = FileUtils.readFile(targetName + '.js');

        var validatorScript = FileUtils.readFile(validatorName + '/validator.js');
        
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