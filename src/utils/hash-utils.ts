import _ from 'the-lodash';

// import * as crypto from "crypto";
const crypto = require('crypto');

export function calculateObjectHash(obj : any) : Buffer
{
    if (_.isNullOrUndefined(obj)) {
        throw new Error('NO Object');
    }

    var str = _.stableStringify(obj);

    const sha256 = crypto.createHash('sha256');
    sha256.update(str);
    var value = <Buffer> sha256.digest();
    return value;
}

export function calculateObjectHashStr(obj : any) : string
{
    return calculateObjectHash(obj).toString('hex');
}