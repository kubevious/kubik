import _ from 'the-lodash'
import { NodeKind, NODE_LABEL_TO_KIND } from '@kubevious/entity-meta'

export const mapLogicItemName = function (kind: string) : NodeKind {
    try
    {
        const value = NODE_LABEL_TO_KIND.get(kind) ;
        return value;
    }
    catch(reason : any)
    {
        // console.log(reason);
        // console.log('KIND: ', kind);
        throw reason;
    }
}
