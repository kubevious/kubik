import { RegistryState } from '@kubevious/helpers/dist/registry-state'
import _ from 'the-lodash'
import { Promise } from 'the-promise'
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

    doesAnyMatch(valueCb: (value: T) => boolean) : Promise<boolean> {
        if (this._matchers.length == 0) {
            return Promise.resolve(true);
        }
        return this._resolveValues().then((values) => {
            for(let value of values) {
                const isMatch = valueCb(value);
                if (isMatch) {
                    return true;
                }
            }
            return false;
        })
    }

    private _resolveValues() : Promise<T[]> {
        let funcMatchers = <MatcherFunc<T>[]>this._matchers.filter((x) => _.isFunction(x))
        let matcherValues = <T[]> this._matchers.filter((x) => !_.isFunction(x))

        return Promise.serial(funcMatchers, (x) => {
            return this._resolveMatcherValue(x)
        }).then((funcValues) => {
            return _.concat(matcherValues, funcValues)
        })
    }

    private _resolveMatcherValue(funcMatcher: MatcherFunc<T>) {
        var params : MatcherFuncArgs = {
            prev: this._prev,
            item: this._item,
        }
        return Promise.resolve(funcMatcher(params))
    }
}

export type MatcherFunc<T> = (args: MatcherFuncArgs) => T;

interface MatcherFuncArgs
{
    item: ScriptItem,
    prev?: ScriptItem
}