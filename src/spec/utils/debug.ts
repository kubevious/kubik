import _ from 'the-lodash'

export const stringify = function (
    value: any
): string {
    if (_.isFunction(value)) {
        return value.toString()
    }
    if (_.isObject(value)) {
        return JSON.stringify(value)
    }
    return value
}
