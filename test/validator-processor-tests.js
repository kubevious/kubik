const should = require('should');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('validator-processor-tests', function() {

  setupTest('logic-image-01', 'item-01', function(result) {
    (result.hasErrors).should.be.equal(true);
  });

  setupTest('logic-image-01', 'item-02', function(result) {
    (result.hasErrors).should.be.equal(false);
  });


  /*****/
  function setupTest(caseName, itemName, validateCb, debugOutputObjects)
  {
    it(caseName + '_' + itemName, function() {

      var validatorScript = FileUtils.readFile('validator/' + caseName + '/validator.js');
      var itemJson = FileUtils.readJsonData('validator/' + caseName + '/' + itemName + '.json');

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