import 'mocha';
import should from 'should';
import _ from 'the-lodash';

import { ValidationProcessor, Result } from '../src/processors/validator/processor';
import { readRegistryState, readFile, readModule} from './utils/file-utils';
import { loadExecutionState } from './utils/k8s-utils';

describe('validator-processor-tests', function() {

  setupTest('logic-image-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(true);
    should(result.validation!.hasWarnings).be.equal(false);
  });

  setupTest('logic-image-01', 'item-02', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-ingress-parent-01', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-ingress-parent-01', 'item-02', function(result) {
    (result.validation!.hasErrors).should.be.equal(true);
    (result.validation!.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-service-haschildren-01', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(true);
    (result.validation!.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-02', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-03', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-service-haschildren-01', 'item-04', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-container-children-01', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });
  setupTest('logic-container-children-01', 'item-02', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
  });

  setupTest('logic-warn', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (_.keys(result.validation!.errorMsgs).length).should.be.equal(0);
    (result.validation!.hasWarnings).should.be.equal(true);
    (_.keys(result.validation!.warnMsgs).length).should.be.equal(0);
  });

  setupTest('logic-warn-msg', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (_.keys(result.validation!.errorMsgs).length).should.be.equal(0);
    (result.validation!.hasWarnings).should.be.equal(true);
    (_.keys(result.validation!.warnMsgs).length).should.be.equal(1);
    (_.keys(result.validation!.warnMsgs)[0]).should.be.equal("this is My custom Warning");
  });

  setupTest('logic-error-msg', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(true);
    (_.keys(result.validation!.errorMsgs).length).should.be.equal(1);
    (_.keys(result.validation!.errorMsgs)[0]).should.be.equal("My Custom Warning");
    (result.validation!.hasWarnings).should.be.equal(false);
    (_.keys(result.validation!.warnMsgs).length).should.be.equal(0);
  });

  setupTest('logic-marker', 'item-01', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
    (result.validation!.marks)!.should.be.Object();
    (result.validation!.marks!['cool'])!.should.be.true();
    (_.keys(result.validation!.marks)!.length).should.be.equal(1);
  });

  setupTest('logic-marker', 'item-02', function(result) {
    (result.validation!.hasErrors).should.be.equal(false);
    (result.validation!.hasWarnings).should.be.equal(false);
    (result.validation!.marks)!.should.be.Object();
    (result.validation!.marks!['cool'])!.should.be.true();
    (result.validation!.marks!['new'])!.should.be.true();
    (_.keys(result.validation!.marks)!.length).should.be.equal(2);
  });

  setupTest('inner-query-many-logic-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(true);
    (_.keys(result.validation!.errorMsgs)[0]).should.be.equal("Found calico-node DaemonSet app");
    should(result.validation!.hasWarnings).be.equal(false);
  });  

  setupTest('inner-query-count-logic-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(false);
    should(result.validation!.hasWarnings).be.equal(true);
    (_.keys(result.validation!.warnMsgs)[0]).should.be.equal("Found 5 DaemonSet Apps in kube-system");
  });  

  setupTest('inner-query-many-images-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(true);
    (_.keys(result.validation!.errorMsgs)[0]).should.be.equal("Found Quay");
    should(result.validation!.hasWarnings).be.equal(false);
  });  

  setupTest('inner-query-single-images-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(false);
    should(result.validation!.hasWarnings).be.equal(false);
  });

  setupTest('inner-query-count-k8s-api-01', 'item-01', function(result) {
    should(result.validation!.hasErrors).be.equal(false);
    should(result.validation!.hasWarnings).be.equal(true);
    (_.keys(result.validation!.warnMsgs)[0]).should.be.equal("GitLab has 3 Deployments");
  }); 
  

  /*****/
  function setupTest(caseName: string, itemName: string, validateCb: (cb: Result) => void)
  {
    it('validator-processor' + '_' + caseName + '_' + itemName, function() {

      let state = readRegistryState('snapshot-items.json');

      let dirPath = 'validator/' + caseName;

      let validatorScript = readFile(dirPath + '/validator.js');

      let itemDn = readModule(dirPath, itemName);

      const executionState = loadExecutionState();
      let processor = new ValidationProcessor(validatorScript, executionState);
      return processor.prepare()
        .then((result: Result) => {
          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success)!.should.be.true();
          (result.messages)!.should.be.empty();
        })
        .then(() => processor.execute(itemDn, state))
        .then((result: Result) => {
          (result).should.be.an.Object();
          if (!result.success) {
            console.log(result);
          }
          (result.success)!.should.be.true();
          validateCb(result);
        });

    });
  }

});
