const assert = require('assert');
const TargetProcessor = require('../lib/processors/target');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('target-compiler-tests', function() {

  var files = FileUtils.readSamples('target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      var processor = new TargetProcessor(testCase.src);
      return processor.compile()
        .then(result => {
          // console.log('RESULT');
        })
        .catch(reason => {
          // console.log('REASON: ');
          // console.log(reason);
          assert.fail(reason.message);
          // throw reason;
        });

    });

  })

});