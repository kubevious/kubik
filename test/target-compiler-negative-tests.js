const should = require('should');
const TargetProcessor = require('../lib/processors/target/processor');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');

describe('target-compiler-negative-tests', function() {

  var files = FileUtils.readFileContents('invalid-target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      var processor = new TargetProcessor(testCase.src);
      return processor.prepare()
        .then(result => {
          (result).should.be.an.Object();
          (result.success).should.be.false();
          (result.messages).should.not.be.empty();
          for(var x of result.messages)
          {
            (x).should.be.a.String();
          }
        })

    });

  })

});