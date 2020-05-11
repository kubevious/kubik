const should = require('should');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('validator-processor-tests', function() {

  setupPositiveTest('logic-image-01', 'item-01');
  setupNegativeTest('logic-image-01', 'item-02');

  setupPositiveTest('logic-ingress-parent-01', 'item-01');
  setupNegativeTest('logic-ingress-parent-01', 'item-02');
  
  setupNegativeTest('logic-service-haschildren-01', 'item-01');
  setupPositiveTest('logic-service-haschildren-01', 'item-02');
  setupPositiveTest('logic-service-haschildren-01', 'item-03');
  setupPositiveTest('logic-service-haschildren-01', 'item-04');

  setupPositiveTest('logic-container-children-01', 'item-01');
  setupNegativeTest('logic-container-children-01', 'item-02');

  /*****/
  function setupPositiveTest(caseName, itemName, debugOutputObjects)
  {
    setupTest(caseName, itemName, function(result) {
      (result.validation.hasErrors).should.be.equal(false);
    }, debugOutputObjects);
  }

  function setupNegativeTest(caseName, itemName, debugOutputObjects)
  {
    setupTest(caseName, itemName, function(result) {
      (result.validation.hasErrors).should.be.equal(true);
    }, debugOutputObjects);
  }

  function setupTest(caseName, itemName, validateCb, debugOutputObjects)
  {
    it(caseName + '_' + itemName, function() {

      var validatorScript = FileUtils.readFile('validator/' + caseName + '/validator.js');
      var itemJson = FileUtils.readJsonOrJsData('validator/' + caseName + '/' + itemName);

      var processor = new ValidatorProcessor(validatorScript);
      return processor.prepare()
        .then(result => {
          (result).should.be.an.Object();
          (result.success).should.be.true();
          (result.messages).should.be.empty();
        })
        .then(() => processor.execute(itemJson))
        .then(result => {
          validateCb(result);
        });

    });
  }  
  
});