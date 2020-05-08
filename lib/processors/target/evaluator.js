const _ = require('the-lodash');
const Promise = require('the-promise');
const TargetItem = require('./item');

class Evaluator
{
    constructor(state, targetSelector, prev, item, matchers)
    {
        this._state = state;
        this._targetSelector = targetSelector
        this._prev = prev;
        this._item = item;
        this._matchers = matchers;
    }

    doesAnyMatch(valueCb)
    {
        return this.combineValues(valueCb, (a, b) => { 
            if (a == null && b == null) {
                return true;
            }
            return a || b;
        });
    }

    doAllMatch(valueCb)
    {
        return this.combineValues(valueCb, (a, b) => a && b);
    }

    combineValues(valueCb, combineCb)
    {
        return this.getValues(valueCb)
            .then(values => {
                if (values.length == 0) {
                    return combineCb(null, null);
                }
                var value = values[0];
                for(var i = 1; i < values.length; i++)
                {
                    value = combineCb(value, values[i]);
                }

                return value;
            })
    }

    getValues(valueCb)
    {
        return this._resolveMatchers()
            .then(values => {
                if (valueCb) {
                    return values.map(x => valueCb(x));
                }
                return values;
            })
    }

    _resolveMatchers()
    {
        var funcMatchers = this._matchers.filter(x => _.isFunction(x));
        var matcherValues = this._matchers.filter(x => !_.isFunction(x));

        return Promise.serial(funcMatchers, x => {
            return this._resolveMatcherValue(x);
        })
        .then(funcValues => {
            return _.concat(matcherValues, funcValues);
        })
    }

    _resolveMatcherValue(funcMatcher)
    {
        var params = {
            prev: this._prev,
            item: new TargetItem(this._item.dn, this._state)
        }
        return Promise.resolve(funcMatcher(params));
    }
}

module.exports = Evaluator;