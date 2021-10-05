import { Scope } from './scope'

export function makeRootScope(scope: Scope)
{
    return {

        Logic: () => {
            return scope.descendant('Logic');
        },

        select: (kind: string) => {
            return scope.descendant('Logic')
                        .descendant(kind)
        },
    }
}
