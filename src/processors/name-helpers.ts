import _ from 'the-lodash'
import * as KubeviousHelpersDocs from '@kubevious/helpers/dist/docs'

let LOGIC_ITEM_KIND_REVERSE_MAPPINNG: { [name: string]: string } = {}
for (let x of _.keys(KubeviousHelpersDocs.KIND_TO_USER_MAPPING)) {
    LOGIC_ITEM_KIND_REVERSE_MAPPINNG[
        KubeviousHelpersDocs.KIND_TO_USER_MAPPING[x]
    ] = x
}

export const mapLogicItemName = function (kind: string) {
    let value = LOGIC_ITEM_KIND_REVERSE_MAPPINNG[kind]
    if (value) {
        return value
    }
    return _.toLower(kind)
}
