import { RegistryState } from '@kubevious/state-registry'
import _ from 'the-lodash'
import { LogicItem } from '../../spec/target/logic-item'
import { ScriptItem } from '../script-item'

export class Evaluator<T> {
    public _state: RegistryState
    public _targetSelector: LogicItem
    private _item: ScriptItem
    private _matchers: (T | MatcherFunc<T>)[]
    private _prev: ScriptItem

    constructor(
        state: RegistryState,
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem,
        matchers: (T | MatcherFunc<T>)[]
    ) {
        this._state = state
        this._targetSelector = targetSelector
        this._prev = prev
        this._item = item
        this._matchers = matchers
    }

    doesAnyMatch(valueCb: (value: T) => boolean) : boolean {
        if (this._matchers.length == 0) {
            return true;
        }

        const values = this._resolveValues();
        for(let value of values) {
            const isMatch = valueCb(value);
            if (isMatch) {
                return true;
            }
        }
        return false;
    }

    private _resolveValues() : T[] {
        let funcMatchers = <MatcherFunc<T>[]>this._matchers.filter((x) => _.isFunction(x))
        let matcherValues = <T[]> this._matchers.filter((x) => !_.isFunction(x))

        const funcValues = funcMatchers.map(x => this._resolveMatcherValue(x));
        return _.concat(matcherValues, funcValues);
    }

    private _resolveMatcherValue(funcMatcher: MatcherFunc<T>) {
        let params : MatcherFuncArgs = {
            prev: this._prev,
            item: this._item,
        }
        return funcMatcher(params);
    }
}

export type MatcherFunc<T> = (args: MatcherFuncArgs) => T;

interface MatcherFuncArgs
{
    item: ScriptItem,
    prev?: ScriptItem
}