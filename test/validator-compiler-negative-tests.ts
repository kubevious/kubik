import should from 'should';
import _ from 'the-lodash';

import { Result, ValidationProcessor } from '../src/processors/validator/processor';
import { readRegistryState, readFileContents, readModule, listDirectories} from './utils/file-utils';
import { loadExecutionState } from './utils/k8s-utils';

describe('validator-compiler-negative-tests', function() {

  var dirs = listDirectories('invalid-validators');

  dirs.forEach(function(dirEntry: Record<string, string>) {

    var dirPath = 'invalid-validators/' + dirEntry.name;
    var dirContents = readFileContents(dirPath);

    var validatorScript = dirContents['validator.js'];
    if (validatorScript)
    {
      var itemNames =
        _.keys(dirContents)
         .filter(x => _.startsWith(x, 'item-'));

      itemNames.forEach(function(itemName) {

        it('validator-compiler-negative-test-sample-' + dirEntry.name + '-' + itemName, function() {
          var state = readRegistryState('snapshot-items.json');

          var itemDn = readModule(dirPath, itemName);

          const executionState = loadExecutionState();
          var processor = new ValidationProcessor(validatorScript, executionState);
          return processor.prepare()
            .then((result: Result) => {
              (result)!.should.be.an.Object();
              (result.success)!.should.be.true();
              if (!result.success) {
                console.log(result);
              }
              (result.messages)!.should.be.empty();
            })
            .then(() => processor.execute(itemDn, state))
            .then((result: Result) => {
              (result)!.should.be.an.Object();
              (result.success)!.should.be.false();

              (result.messages)!.should.not.be.empty();
              for(var x of result.messages!)
              {
                (x).should.be.a.String();
              }

              (result.validation)!.should.be.an.Object();
              (result.validation!.hasErrors)!.should.be.a.Boolean();
              (result.validation!.hasWarnings)!.should.be.a.Boolean();

            });

        });

      });
    }
  });


});