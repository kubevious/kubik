const should = require('should');
const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('validator-compiler-tests', function() {

  var dirs = FileUtils.listDirectories('validator');

  dirs.forEach(function(dirEntry) {

    var dirPath = 'validator/' + dirEntry.name;
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
              (result.hasErrors).should.be.a.Boolean();
              (result.hasWarnings).should.be.a.Boolean();
            })
            
        });

      });
    }
  });


});