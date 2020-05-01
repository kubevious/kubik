const Compiler = require('../compiler');
const Scope = require('../../spec/target/scope');

class TargetProcessor
{
    constructor(src)
    {
        this._src = src;
    }

    compile()
    {
        return Promise.resolve()
            .then(() => {
                var scope = new Scope(null);

                var compilerValues = {
                    select: (kind) => {
                        return scope.descendent(kind);
                    },
                    resource: (kind, apiGroup) => {
                        return scope.resource(kind, apiGroup);
                    }
                };
        
                var compiler = new Compiler(this._src, 'RULE_TARGET', compilerValues);
                return compiler.compile();
            });
    }

}

module.exports = TargetProcessor;