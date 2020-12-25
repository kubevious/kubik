import should from 'should';
import _ from 'the-lodash';
import { Result } from '../src/processors/validator/processor';

import { ValidationProcessor } from '../src/processors/validator/processor';

import { readRegistryState, listDirectories, readFileContents, readModule } from './utils/file-utils';

describe('validator-compiler-tests', function() {

  let dirs = listDirectories('validator');

  dirs.forEach(function(dirEntry: Record<string, string>) {

    let dirPath = 'validator/' + dirEntry.name;
    let dirContents = readFileContents(dirPath);

    let validatorScript = dirContents['validator.js'];
    if (validatorScript)
    {
      let itemNames =
        _.keys(dirContents)
         .filter(x => _.startsWith(x, 'item-') && _.endsWith(x, '.js') );

      itemNames.forEach(function(itemName) {

        it('sample-' + dirEntry.name + '-' + itemName, function() {

          let state = readRegistryState('snapshot-items.json');

          let itemDn = readModule(dirPath, itemName);

          let processor = new ValidationProcessor(validatorScript);
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
