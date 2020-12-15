import _ from 'the-lodash'
import { FilterItem } from '../target/k8s-item'

export const stringify = function (
    value: string | FilterItem | Function
): string {
    if (_.isFunction(value)) {
        return value.toString()
    }
    if (_.isObject(value)) {
        return JSON.stringify(value)
    }
    return value
}
