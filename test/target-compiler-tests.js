const should = require('should');
const Lodash = require('the-lodash');
const _ = Lodash.default;

const TargetProcessor = require('../lib/processors/target/processor');
const FileUtils = require('./utils/file-utils');


describe('target-compiler-tests', function() {

  var files = FileUtils.readFileContents('target');
  var testCases = _.keys(files).map(x => ({ name: x, src: files[x]}));

  testCases.forEach(function(testCase) {

    it('sample-' + testCase.name, function() {

      var processor = new TargetProcessor(testCase.src);
      return processor.prepare()
        .then(result => {
          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success).should.be.true();
          (result.messages).should.be.empty();
        })

    });

  })


});