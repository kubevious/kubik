const should = require('should');
const TargetProcessor = require('../lib/processors/target/processor');
const FileUtils = require('./utils/file-utils');
const DnUtils = require('./utils/dn-utils');
const _ = require('the-lodash');
const RegistryState = require('kubevious-helpers/lib/registry-state');

describe('target-processor-tests', function() {

  setupTest('process-logic-target-no-filter', 'logic-item-01', function(results) {
    for(var result of results)
    {
      (result).should.be.an.Object();
      (result.dn).should.be.a.String();
      (result.node).should.be.an.Object();
      (result.node.kind).should.be.equal('image');
    }

    (results.length).should.be.equal(116);
  });


  setupTest('process-logic-target-single-descendants', 'logic-item-descendants-01', 
    function(results) {
      for(var result of results)
      {
        (result).should.be.an.Object();
        (result.dn).should.be.a.String();
        (result.node).should.be.an.Object();
        (result.node.kind).should.be.equal('port');
      }

      (results.length).should.be.equal(68);
    }
  );


  setupTest('process-logic-target-descendants-and-children', 'logic-item-descendants-02', 
    function(results) {
      for(var result of results)
      {
        (result).should.be.an.Object();
        (result.dn).should.be.a.String();
        (result.node).should.be.an.Object();
        (result.node.kind).should.be.equal('ingress');
      }

      (results.length).should.be.equal(5);
    }
  );


  setupTest('process-logic-target-name-filter', 'logic-item-filter-01', 
    function(results) {
      for(var result of results)
      {
        (result).should.be.an.Object();
        (result.dn).should.be.a.String();
        (result.node).should.be.an.Object();
        (result.node.kind).should.be.equal('app');

        DnUtils.startsWithAnyOf(result.dn, ['root/ns-[gitlab]', 'root/ns-[sock-shop]']).should.be.equal(true, result.dn);
      }

      (results.length).should.be.equal(34);
    }
  );


  setupTest('process-logic-target-custom-filter-simple', 'logic-item-custom-filter-01', 
    function(results) {
      for(var result of results)
      {
        (result).should.be.an.Object();
        (result.dn).should.be.a.String();
        (result.node).should.be.an.Object();
        (result.node.kind).should.be.equal('service');

        DnUtils.endsWithAnyOf(result.dn, ['/service-[NodePort]']).should.be.equal(true, result.dn);
      }

      (results.length).should.be.equal(5);
    }
  );


  setupTest('process-logic-target-custom-filter-parent', 'logic-item-custom-filter-parent-01', 
  function(results) {
    for(var result of results)
    {
      (result).should.be.an.Object();
      (result.dn).should.be.a.String();
      (result.node).should.be.an.Object();
      (result.node.kind).should.be.equal('service');

      DnUtils.endsWithAnyOf(result.dn, ['/service-[NodePort]']).should.be.equal(true, result.dn);
    }

    (results.length).should.be.equal(2);
  }
);


  /*****/
  function setupTest(name, targetFileName, validateCb, debugOutputObjects)
  {
    it(name, function() {

      var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
      var state = new RegistryState(null, snapshotInfo);

      var targetScript = FileUtils.readFile('target/' + targetFileName + '.js');

      var processor = new TargetProcessor(targetScript);
      return processor.prepare()
        .then(result => {
          if (debugOutputObjects)
          {
            processor._scope.debugOutput();
          }

          (result).should.be.an.Object();
          (result.success).should.be.true();
          (result.messages).should.be.empty();

          return processor.execute(state);
        })
        .then(results => {

          (results).should.be.an.Array;

          if (debugOutputObjects)
          {
            console.log('COUNT: ' + results.length);
            for(var result of results)
            {
              console.log('* ' + result.dn);
            }
          }

          validateCb(results)
        })
        ;
    });
  }

});