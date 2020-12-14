const should = require('should');
const Lodash = require('the-lodash');
const _ = Lodash.default;

const ValidatorProcessor = require('../lib/processors/validator/processor');
const FileUtils = require('./utils/file-utils');
const { RegistryState } = require('@kubevious/helpers/dist/registry-state');

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
          var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
          var state = new RegistryState(snapshotInfo);
    
          var itemDn = FileUtils.readModule(dirPath, itemName);

          var processor = new ValidatorProcessor(validatorScript);
          return processor.prepare()
            .then(result => {
              (result).should.be.an.Object();
              (result.success).should.be.true();
              if (!result.success) {
                console.log(result);
              }
              (result.messages).should.be.empty();
            })
            .then(() => processor.execute(itemDn, state))
            .then(result => {
              (result).should.be.an.Object();
              (result.success).should.be.false();

              (result.messages).should.not.be.empty();
              for(var x of result.messages)
              {
                (x).should.be.a.String();
              }

              (result.validation).should.be.an.Object();
              (result.validation.hasErrors).should.be.a.Boolean();
              (result.validation.hasWarnings).should.be.a.Boolean();

            });
            
        });

      });
    }
  });


});