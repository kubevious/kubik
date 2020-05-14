const should = require('should');
const _ = require('the-lodash');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const RegistryState = require('kubevious-helpers').RegistryState;

describe('validator-processor-tests', function() {

  setupNegativeTest('logic-image-01', 'item-01');
  setupPositiveTest('logic-image-01', 'item-02');

  setupPositiveTest('logic-ingress-parent-01', 'item-01');
  setupNegativeTest('logic-ingress-parent-01', 'item-02');
  
  setupNegativeTest('logic-service-haschildren-01', 'item-01');
  setupPositiveTest('logic-service-haschildren-01', 'item-02');
  setupPositiveTest('logic-service-haschildren-01', 'item-03');
  setupPositiveTest('logic-service-haschildren-01', 'item-04');

  setupPositiveTest('logic-container-children-01', 'item-01');
  setupPositiveTest('logic-container-children-01', 'item-02');

  /*****/
  function setupPositiveTest(caseName, itemName, debugOutputObjects)
  {
    setupTest(caseName, itemName, function(result) {
      if (result.validation.hasErrors) {
        console.log(result);
      }
      (result.validation.hasErrors).should.be.equal(false);
    }, debugOutputObjects);
  }

  function setupNegativeTest(caseName, itemName, debugOutputObjects)
  {
    setupTest(caseName, itemName, function(result) {
      if (!result.validation.hasErrors) {
        console.log(result);
      }
      (result.validation.hasErrors).should.be.equal(true);
    }, debugOutputObjects);
  }

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