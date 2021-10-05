import _ from 'the-lodash';
import { parseDn } from '@kubevious/entity-meta';

export function startsWithAnyOf(dn: string, options: string[]): boolean
{
    for(var x of options)
    {
        if (_.startsWith(dn, x)) {
            return true;
        }
    }
    return false;
}

export function endsWithAnyOf(dn: string, options: string[]): boolean
{
    for(var x of options)
    {
        if (_.endsWith(dn, x)) {
            return true;
        }
    }
    return false;
}

export function kind(dn: string): string | null
{
    var parts = parseDn(dn);
    var lastPart = _.last(parts);
    if (!lastPart) {
        return null;
    }
    return lastPart.kind;
}
