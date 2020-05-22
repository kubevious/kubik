const should = require('should');
const _ = require('the-lodash');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const RegistryState = require('kubevious-helpers').RegistryState;

describe('validator-processor-tests', function() {

  setupTest('logic-image-01', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(true);
    (result.validation.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-image-01', 'item-02', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-ingress-parent-01', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-ingress-parent-01', 'item-02', function(result) {
    (result.validation.hasErrors).should.be.equal(true);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  
  setupTest('logic-service-haschildren-01', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(true);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-02', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-03', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-04', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-container-children-01', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-container-children-01', 'item-02', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-warn', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(true);
  });

  setupTest('logic-marker', 'item-01', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
    (result.validation.marks).should.be.Object();
    (result.validation.marks['cool']).should.be.true();
    (_.keys(result.validation.marks).length).should.be.equal(1);
  });
  setupTest('logic-marker', 'item-02', function(result) {
    (result.validation.hasErrors).should.be.equal(false);
    (result.validation.hasWarnings).should.be.equal(false);
    (result.validation.marks).should.be.Object();
    (result.validation.marks['cool']).should.be.true();
    (result.validation.marks['new']).should.be.true();
    (_.keys(result.validation.marks).length).should.be.equal(2);
  });

  /*****/
  function setupTest(caseName, itemName, validateCb, debugOutputObjects)
  {
    it(caseName + '_' + itemName, function() {

      var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
      var state = new RegistryState(snapshotInfo);

      var dirPath = 'validator/' + caseName;

      var validatorScript = FileUtils.readFile(dirPath + '/validator.js');

      var itemDn = FileUtils.readModule(dirPath, itemName);

      var processor = new ValidatorProcessor(validatorScript);
      return processor.prepare()
        .then(result => {
          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success).should.be.true();
          (result.messages).should.be.empty();
        })
        .then(() => processor.execute(itemDn, state))
        .then(result => {
          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success).should.be.true();
          validateCb(result);
        });

    });
  }  
  
});