import 'mocha';
import should = require('should');
import _ from 'the-lodash';

import { TargetProcessor } from '../src/processors/target/processor';

const FileUtils = require('./utils/file-utils');

describe('target-compiler-tests', function() {

  var files = FileUtils.readFileContents('target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      var processor = new TargetProcessor(testCase.src);
      return processor.prepare()
        .then(result => {
          should(result).be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success).should.be.true();
          (result.messages).should.be.empty();
        })

    });

  })


});