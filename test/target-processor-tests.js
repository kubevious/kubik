const should = require('should');
const _ = require('the-lodash');
const TargetProcessor = require('../lib/processors/target/processor');
const FileUtils = require('./utils/file-utils');
const DnUtils = require('./utils/dn-utils');
const RegistryState = require('kubevious-helpers').RegistryState;

describe('target-processor-tests', function() {

  setupTest('process-logic-target-no-filter', 'logic-item-01', function(items) {
    for(var item of items)
    {
      (item).should.be.an.Object();
      (item.dn).should.be.a.String();
      (DnUtils.kind(item.dn)).should.be.equal('image');
    }

    (items.length).should.be.equal(116);
  });


  setupTest('process-logic-target-single-descendants', 'logic-item-descendants-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        (DnUtils.kind(item.dn)).should.be.equal('port');
      }

      (items.length).should.be.equal(68);
    }
  );


  setupTest('process-logic-target-descendants-and-children', 'logic-item-descendants-02', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String(); 
        (DnUtils.kind(item.dn)).should.be.equal('ingress');
      }

      (items.length).should.be.equal(5);
    }
  );


  setupTest('process-logic-target-name-filter', 'logic-item-filter-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        (DnUtils.kind(item.dn)).should.be.equal('app');

        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[gitlab]', 'root/ns-[sock-shop]']).should.be.equal(true);
      }

      (items.length).should.be.equal(34);
    }
  );


  setupTest('process-logic-target-custom-filter-simple', 'logic-item-custom-filter-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        (DnUtils.kind(item.dn)).should.be.equal('service');

        DnUtils.endsWithAnyOf(item.dn, ['/service-[NodePort]']).should.be.equal(true);
      }

      (items.length).should.be.equal(5);
    }
  );


  setupTest('process-logic-target-custom-filter-parent', 'logic-item-custom-filter-parent-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        (DnUtils.kind(item.dn)).should.be.equal('service');

        DnUtils.endsWithAnyOf(item.dn, ['/service-[NodePort]']).should.be.equal(true);
      }

      (items.length).should.be.equal(2);
    }
  );


  /*****/
  function setupTest(name, targetFileName, validateCb, debugOutputObjects)
  {
    it(name, function() {

      var snapshotInfo = FileUtils.readJsonData('snapshot-items.json');
      var state = new RegistryState(snapshotInfo);

      var targetScript = FileUtils.readFile('target/' + targetFileName + '.js');

      var processor = new TargetProcessor(targetScript);
      return processor.prepare()
        .then(result => {
          if (debugOutputObjects)
          {
            processor._scope.debugOutput();
          }

          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success).should.be.true();
          (result.messages).should.be.empty();

          return processor.execute(state);
        })
        .then(result => {

          (result.items).should.be.an.Array;

          if (debugOutputObjects)
          {
            console.log('COUNT: ' + result.items.length);
            for(var item of result.items)
            {
              console.log('* ' + item.dn);
            }
          }

          validateCb(result.items)
        })
        ;
    });
  }

});