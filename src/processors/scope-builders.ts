import { Scope } from "../spec/target/scope";
import { ExecutionState } from "./execution-state";
import { ScriptItem } from "./script-item";

export interface RootScopeBuilder
{
    setup(name: string, func: any) : void;
}

export type TargetScopeBuilderExecutor = (rootScope: RootScopeBuilder, scope: Scope, executionState: ExecutionState) => void;
export type ValidatorScopeBuilderExecutor = (rootScope: RootScopeBuilder, item: ScriptItem, executionState: ExecutionState) => void;