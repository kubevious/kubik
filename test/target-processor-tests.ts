import 'mocha';
import should = require('should');
import _ from 'the-lodash';


import { FinalItems, TargetProcessor } from '../src/processors/target/processor';

import { readRegistryState, readFile } from './utils/file-utils';

import * as DnUtils from './utils/dn-utils';

describe('target-processor-tests', function() {

  setupTest('process-logic-target-no-filter', 'logic-item-01', function(items) {
    for(var item of items)
    {
      (item).should.be.an.Object();
      (item.dn).should.be.a.String();
      should(DnUtils.kind(item.dn)).be.equal('image');
    }

    (items.length).should.be.equal(130);
  });


  setupTest('process-logic-target-single-descendants', 'logic-item-descendants-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('port');
      }

      (items.length).should.be.equal(71);
    }
  );


  setupTest('process-logic-target-descendants-and-children', 'logic-item-descendants-02', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String(); 
        should(DnUtils.kind(item.dn)).be.equal('ingress');
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
        should(DnUtils.kind(item.dn)).be.equal('app');

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
        should(DnUtils.kind(item.dn)).be.equal('service');
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
        should(DnUtils.kind(item.dn)).be.equal('service');
      }

      (items.length).should.be.equal(2);
    }
  );


  setupTest('process-logic-target-custom-filter-descendans', 'logic-item-custom-filter-02', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('app');

        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[gitlab]']).should.be.equal(true);
      }

      (items.length).should.be.equal(3);
    }
  );

  setupTest('process-logic-target-custom-filter-memory-unit', 'logic-item-custom-filter-unit-memory-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('cont');

        DnUtils.startsWithAnyOf(item.dn, [
          'root/ns-[kubevious]/app-[kubevious-mysql]/cont-[mysql]',
          'root/ns-[openfaas]/app-[prometheus]/cont-[prometheus]']).should.be.equal(true);
      }

      (items.length).should.be.equal(2);
    }
  );

  setupTest('process-logic-target-custom-filter-memory-unit', 'logic-item-custom-filter-unit-percentage-01', 
    function(items) {
      console.log(items.map(x => x))
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('ns');

        DnUtils.startsWithAnyOf(item.dn, [
          'root/ns-[kube-system]'
        ]).should.be.equal(true);
      }

      (items.length).should.be.equal(1);
    }
  );

  //
  setupTest('process-logic-target-label-filter', 'logic-item-label-filter-01', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('launcher');

        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[gitlab]']).should.be.equal(true);
      }

      (items.length).should.be.equal(1);
    }
  );

  //
  setupTest('process-logic-target-label-filter', 'logic-item-label-filter-03', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('launcher');

        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[openfaas]']).should.be.equal(true);
      }

      (items.length).should.be.equal(2);
    }
  );

  //
  setupTest('process-logic-target-label-filter', 'logic-item-label-filter-04', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('launcher');
        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[openfaas]']).should.be.equal(true);
      }

      (items.length).should.be.equal(1);
    }
  );

  //
  setupTest('process-logic-target-label-filter', 'logic-item-label-filter-05', 
    function(items) {
      (items.length).should.be.equal(0);
    }
  );

  //
  setupTest('process-logic-target-label-filter', 'logic-item-label-filter-06', 
    function(items) {
      for(var item of items)
      {
        (item).should.be.an.Object();
        (item.dn).should.be.a.String();
        should(DnUtils.kind(item.dn)).be.equal('launcher');

        DnUtils.startsWithAnyOf(item.dn, ['root/ns-[openfaas]', 'root/ns-[gitlab]']).should.be.equal(true);
      }

      (items.length).should.be.equal(4);
    }
  );


  /*****/
  function setupTest(name: string, targetFileName: string, validateCb: (items: FinalItems[]) => void, debugOutputObjects?: boolean)
  {
    it(name + '::' + targetFileName, function() {

      var state = readRegistryState('snapshot-items.json');

      var targetScript = readFile('target/' + targetFileName + '.js');

      var processor = new TargetProcessor(targetScript);
      return processor.prepare()
        .then(result => {
          if (debugOutputObjects)
          {
            processor.scope.debugOutput();
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