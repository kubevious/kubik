import "mocha";
import should = require("should");
import _ from "the-lodash";

import { FinalItems } from "../src/processors/query/fetcher";
import { TargetProcessor } from "../src/processors/target/processor";
import { readFileContents, readRegistryState } from "./utils/file-utils";
import { loadExecutionState } from './utils/k8s-utils';

describe("target-executor-tests", function () {
  var files = readFileContents("target");
  var testCases = _.keys(files).map((x) => ({ name: x, src: files[x] }));

  testCases.forEach(function (testCase) {
    it("target-executor-success-" + testCase.name, function () {
        return processTargetValidatorTestFromSrc(testCase.src);
    });
  });

  it("target-executor-validate_api-version-kind-01", function () {
    return processTargetValidatorTest("api-version-kind-01")
        .then(result => {
            should(result.length).be.equal(68);
        })
  });

  it("target-executor-validate_api-version-kind-name-01", function () {
    return processTargetValidatorTest("api-version-kind-name-01")
        .then(result => {
            should(result.length).be.equal(2);
        })
  });

  it("target-executor-validate_api-version-kind-ns-01", function () {
    return processTargetValidatorTest("api-version-kind-ns-01")
        .then(result => {
            should(result.length).be.equal(16);
        })    
  });

  it("target-executor-validate_api-kind-01", function () {
    return processTargetValidatorTest("api-kind-01")
        .then(result => {
            should(result.length).be.equal(68);
        })
  });

  it("target-executor-validate_api-version-kind-label-filter-01", function () {
    return processTargetValidatorTest("api-version-kind-label-filter-01")
        .then(result => {
            should(result.length).be.equal(3);
        })    
  });

  it("target-executor-validate_logic-item-02", function () {
    return processTargetValidatorTest("logic-item-02")
        .then(result => {
            should(result.length).be.equal(5);
            // console.log(result);
        })    
  });

  it("target-executor-validate_logic-item-03", function () {
    return processTargetValidatorTest("logic-item-03")
        .then(result => {
            should(result.length).be.equal(16);
            // console.log(result);
        })    
  });

  /*****/

  function processTargetValidatorTest(name: string)
  {
    const src = files[name + '.js'];
    return processTargetValidatorTestFromSrc(src);
  }
});


function processTargetValidatorTestFromSrc(src: string) : Promise<FinalItems[]>
{
    const state = readRegistryState("snapshot-items.json");

    const executionState = loadExecutionState();
    const processor = new TargetProcessor(src, executionState);
    return processor.prepare().then((result) => {
      should(result).be.an.Object();
      if (!result.success) {
        console.log("******************************* PREPARE FAILED:");
        console.log(result);
      }
      result.success.should.be.true();
      result.messages.should.be.empty();

      if (result.success) {
        return processor.execute(state).then((execResult) => {
          if (!execResult.success) {
            console.log("EXECUTOR FAILED.");
            console.log("******************************** EXECUTE FAILED:");
          }
          execResult.success.should.be.true();

          console.log(`    | ITEM COUNT: ${execResult.items.length}`);

          for (const finalItem of execResult.items) {
            console.log(`    |   -> ${finalItem.dn}`);
          }

          return execResult.success ? execResult.items : [];
        });
      }

      return [];
    });

}
