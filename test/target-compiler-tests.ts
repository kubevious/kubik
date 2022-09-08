import 'mocha';
import should = require('should');
import _ from 'the-lodash';

import { TargetProcessor } from '../src/processors/target/processor';
import { readFileContents } from './utils/file-utils';
import { loadExecutionState } from './utils/k8s-utils';

describe('target-compiler-tests', function() {

  var files = readFileContents('target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      const executionState = loadExecutionState();
      const processor = new TargetProcessor(testCase.src, executionState);
      return processor.prepare()
        .then(result => {
          should(result).be.an.Object();
          if (!result.success) {
            console.log(result);
            console.log('********************************');
          }
          (result.success).should.be.true();
          (result.messages).should.be.empty();
        })

    });

  })


});
