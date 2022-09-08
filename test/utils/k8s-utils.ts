import { readRegistryState } from "./file-utils";
import { ExecutionState } from '../../src/processors/execution-state';

export function loadExecutionState()
{
    const state = readRegistryState('snapshot-items.json');
    const executionState = new ExecutionState(state);
    return executionState;
}