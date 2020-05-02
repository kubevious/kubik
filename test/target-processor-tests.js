const shoud = require('should');
const TargetProcessor = require('../lib/processors/target');
const FileUtils = require('./utils/file-utils');
const _ = require('the-lodash');
const RegistryState = require('kubevious-helpers/lib/registry-state');

describe('target-processor-tests', function() {

  it('process-logic-target', function() {

    var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
    var state = new RegistryState(null, snapshotInfo);

    var targetScript = FileUtils.readFile('target/logic-item-filter-01.js');

    var processor = new TargetProcessor(targetScript);
    return processor.prepare()
      .then(result => {
        (result).should.be.an.Object();
        (result.success).should.be.true();
        (result.messages).should.be.empty();

        return processor.execute(state);
      })
      .then(result => {

      })
      ;

    });

});