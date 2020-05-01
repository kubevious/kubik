const _ = require('the-lodash');
const Promise = require('the-promise');

class Compiler
{
    constructor(src, name, values)
    {
        this._src = src;
        this._name = name;
        this._values = values;
        if (!this._values) {
            this._values = {};
        }
    }

    compile()
    {
        return new Promise((resolve, reject) => {
            try
            {
            const PARAMS_TO_HIDE = {
                'exports': true,
                'require': true,
                'module': true, 
                '__filename': true,
                '__dirname': true,
                'Promise': true
            }
        
            for(var x of _.keys(global))
            {
                if (!PARAMS_TO_HIDE[x])
                {
                    PARAMS_TO_HIDE[x] = true;
                }
            }
        
            var allParamNames = [];
            allParamNames = _.concat(allParamNames, _.keys(PARAMS_TO_HIDE));

            for(var key of _.keys(this._values))
            {
                allParamNames.push(key);
            }
        
            var finalSrc =  
                "module.exports = function(" + allParamNames.join(', ') + ") {\n" + 
                "    'use strict';\n" + 
                this._src + 
                "\n};";
        
            var Module = module.constructor;
            var m = new Module();
            // console.log("*** >>>>>>>>")
            // console.log(finalSrc)
                
            m._compile(finalSrc, this._name);
        
            // console.log("*** --------")
        
            var result = null;
                var paramValues = [];
                paramValues = _.concat(paramValues, _.keys(PARAMS_TO_HIDE).map(x => undefined));

                for(var key of _.keys(this._values))
                {
                    paramValues.push(this._values[key]);
                }
        
                // console.log(paramValues)
        
                result = m.exports.apply(null, paramValues);
                resolve(result);
            }
            catch(reason)
            {
                // console.log("*** ERROR: ");
                // console.log(reason);
                reject(reason);
            }
        });
    }
}

module.exports = Compiler;