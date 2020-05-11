const should = require('should');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('validator-compiler-negative-tests', function() {

  var dirs = FileUtils.listDirectories('invalid-validators');

  dirs.forEach(function(dirEntry) {

    var dirPath = 'invalid-validators/' + dirEntry.name;
    var dirContents = FileUtils.readFileContents(dirPath);

    var validatorScript = dirContents['validator.js'];
    if (validatorScript)
    {
      var itemNames = 
        _.keys(dirContents)
         .filter(x => _.startsWith(x, 'item-'));

      itemNames.forEach(function(itemName) {

        it('sample-' + dirEntry.name + '-' + itemName, function() {
          var itemObj = null;
          if (_.endsWith(itemName, '.json'))
          {
            var itemContents = dirContents[itemName];
            itemObj = JSON.parse(itemContents);
          }
          else if (_.endsWith(itemName, '.js'))
          {
            itemObj = FileUtils.readModule(dirPath, itemName);
          }
          else {
            throw new Error("Unknown extension: " + itemName)
          }

          var processor = new ValidatorProcessor(validatorScript);
          return processor.prepare()
            .then(result => {
              (result).should.be.an.Object();
              (result.success).should.be.true();
              (result.messages).should.be.empty();
            })
            .then(() => processor.execute(itemObj))
            .then(result => {
              (result).should.be.an.Object();
              (result.success).should.be.false();
              (result.messages).should.not.be.empty();
              (result.validation).should.be.an.Object();
              (result.validation.hasErrors).should.be.a.Boolean();
              (result.validation.hasWarnings).should.be.a.Boolean();
            })
            
        });

      });
    }
  });


});