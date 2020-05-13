const should = require('should');
const _ = require('the-lodash');
const FileUtils = require('./utils/file-utils');
const RuleProcessor = require('../lib/processors/rule/processor');
const RegistryState = require('kubevious-helpers').RegistryState;

describe('rule-processor-negative-tests', function() {

    setupTest(
        'target/logic-item-01',
        'invalid-validators/logic-image-01', 
        (result) => {
            (result).should.be.an.Object();
            (result.success).should.be.false();
            (result.messages).should.not.be.empty();
            (result.messages.length).should.be.equal(2);
        });

    setupTest(
        'invalid-target/error-01',
        'validator/logic-image-01', 
        (result) => {
            (result).should.be.an.Object();
            (result.success).should.be.false();
            (result.messages).should.not.be.empty();
            (result.messages.length).should.be.equal(2);
        });        

  /*****/

  function setupTest(targetName, validatorName, validateCb, debugOutputObjects)
  {

    it(targetName + '_' + validatorName, function() {

        var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
        var state = new RegistryState(snapshotInfo);
  
        var targetScript = FileUtils.readFile(targetName + '.js');

        var validatorScript = FileUtils.readFile(validatorName + '/validator.js');
        
        var processor = new RuleProcessor(state, {
            target: targetScript,
            script: validatorScript
        });
        return processor.process()
            .then(result => {
                if (validateCb) {
                    validateCb(result);
                }
            });

    });    

  }  
  
});