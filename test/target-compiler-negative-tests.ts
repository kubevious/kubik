import should from 'should';
import _ from 'the-lodash';

import { TargetProcessor } from '../src/processors/target/processor';
import { readFileContents } from './utils/file-utils';
import { loadExecutionState } from './utils/k8s-utils';


describe('target-compiler-negative-tests', function() {

  var files = readFileContents('invalid-target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      const executionState = loadExecutionState();

      const processor = new TargetProcessor(testCase.src, executionState);
      return processor.prepare()
        .then((result: Record<string, string[] | boolean>) => {
          (result).should.be.an.Object();
          (result.success).should.be.false();
          (result.messages).should.not.be.empty();
          for(var x of result.messages as string[])
          {
            (x).should.be.a.String();
          }
        })

    });

  })

});
