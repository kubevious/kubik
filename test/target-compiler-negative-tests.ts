import should from 'should';
import _ from 'the-lodash';

import { TargetProcessor } from '../src/processors/target/processor';
import { readFileContents } from './utils/file-utils';


describe('target-compiler-negative-tests', function() {

  var files = readFileContents('invalid-target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      var processor = new TargetProcessor(testCase.src);
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
