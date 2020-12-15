import { RegistryState } from '@kubevious/helpers/dist/registry-state'
import _ from 'the-lodash'
import { Promise } from 'the-promise'
import { LogicItem } from '../../spec/target/logic-item'
import { ScriptItem } from '../script-item'

export class Evaluator {
    public _state: RegistryState
    public _targetSelector: LogicItem
    private _item: ScriptItem
    private _matchers: string[]
    private _prev: ScriptItem

    constructor(
        state: RegistryState,
        targetSelector: LogicItem,
        prev: ScriptItem,
        item: ScriptItem,
        matchers: string[]
    ) {
        this._state = state
        this._targetSelector = targetSelector
        this._prev = prev
        this._item = item
        this._matchers = matchers
    }

    doesAnyMatch(valueCb?: (cb?: any) => any) {
        return this.combineValues(valueCb!, (a, b) => {
            if (a == null && b == null) {
                return true
            }
            return a || b
        })
    }

    doAllMatch(valueCb: () => any) {
        return this.combineValues(valueCb, (a, b) => a && b)
    }

    combineValues(valueCb?: () => any, combineCb?: (a: any, b: any) => any) {
        return this.getValues(valueCb!).then((values) => {
            if (values.length == 0) {
                return combineCb!(null, null)
            }
            var value = values[0]
            for (var i = 1; i < values.length; i++) {
                value = combineCb!(value, values[i])
            }

            return value
        })
    }

    getValues(valueCb: (x: any) => any) {
        return this._resolveMatchers().then((values) => {
            if (valueCb) {
                return values.map((x) => valueCb(x))
            }
            return values
        })
    }

    _resolveMatchers() {
        var funcMatchers = this._matchers.filter((x) => _.isFunction(x))
        var matcherValues = this._matchers.filter((x) => !_.isFunction(x))

        return Promise.serial(funcMatchers, (x) => {
            return this._resolveMatcherValue(x)
        }).then((funcValues) => {
            return _.concat(matcherValues, funcValues)
        })
    }

    _resolveMatcherValue(funcMatcher: any) {
        var params = {
            prev: this._prev,
            item: this._item,
        }
        return Promise.resolve(funcMatcher(params))
    }
}
