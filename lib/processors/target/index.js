const _ = require('the-lodash');
const Compiler = require('../compiler');
const Scope = require('../../spec/target/scope');

class TargetProcessor
{
    constructor(src)
    {
        this._src = src;
        this._scope = new Scope(null);
        this._compilerMessages = [];
    }

    get scope() {
        return this._scope;
    }

    prepare()
    {
        this._compilerMessages = [];
        var result = {
            success: false,
            messages: this._compilerMessages
        };

        return this._loadModule()
            .then(() => {
                this._validate();
                result.success = (result.messages.length == 0);
            })
            .catch(reason => {
                result.success = false;
                result.messages.push(reason.message);
            })
            .then(() => result)
            ;
    }

    execute(state)
    {
        console.log("[EXECUTE]")

        var items = [];
        for(var x of this._scope._chain)
        {
            items.push({ prev: null, item: x});
        }

        for(var x of items)
        {
            console.log(x);
        }
    }

    _loadModule()
    {
        return Promise.resolve()
            .then(() => {
                var compilerValues = {
                    select: (kind) => {
                        return this._scope.descendent(kind);
                    },
                    resource: (kind, apiGroup) => {
                        return this._scope.resource(kind, apiGroup);
                    }
                };
        
                var compiler = new Compiler(this._src, 'RULE_TARGET', compilerValues);
                return compiler.compile();
            });
    }

    _validate()
    {
        if (this._scope._chain.length == 0) {
            this._compilerMessages.push("No target specified.");
            return;
        }

        this._validateScope(this._scope);
    }

    _validateScope(scope)
    {
        if (this._scope._chain.length > 1) {
            this._compilerMessages.push("Fanout targets are not supported.");
            return;
        }

        for(var item of scope._chain)
        {
            this._validateItem(item);
        }
    }

    _validateItem(item)
    {
        this._validateScope(item._scope);
    }

}

module.exports = TargetProcessor;