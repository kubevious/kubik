import should from 'should';
import _ from 'the-lodash';
import { RegistryState } from '@kubevious/helpers/dist/registry-state';
import { Result } from '../src/processors/validator/processor';

import { ValidationProcessor } from '../src/processors/validator/processor';
const FileUtils = require('./utils/file-utils');

describe('validator-compiler-tests', function() {

  var dirs = FileUtils.listDirectories('validator');

  dirs.forEach(function(dirEntry: Record<string, string>) {

    var dirPath = 'validator/' + dirEntry.name;
    var dirContents = FileUtils.readFileContents(dirPath);

    var validatorScript = dirContents['validator.js'];
    if (validatorScript)
    {
      var itemNames =
        _.keys(dirContents)
         .filter(x => _.startsWith(x, 'item-') && _.endsWith(x, '.js') );

      itemNames.forEach(function(itemName) {

        it('sample-' + dirEntry.name + '-' + itemName, function() {

          var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
          var state = new RegistryState(snapshotInfo);

          var itemDn = FileUtils.readModule(dirPath, itemName);

          var processor = new ValidationProcessor(validatorScript);
          return processor.prepare()
            .then((result: Result) => {
              (result).should.be.an.Object();
              if (!result.success) {
                console.log(result);
              }
              (result.success)!.should.be.true();
              (result.messages)!.should.be.empty();
            })
            .then(() => processor.execute(itemDn, state))
            .then((result: Result) => {
              (result).should.be.an.Object();
              if (!result.success) {
                console.log(result);
              }
              (result.success)!.should.be.true();
              (result.messages)!.should.be.empty();
              (result.validation)!.should.be.an.Object();
              (result.validation!.hasErrors)!.should.be.a.Boolean();
              (result.validation!.hasWarnings)!.should.be.a.Boolean();
            })

        });

      });
    }
  });


});
