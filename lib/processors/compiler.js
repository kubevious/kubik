const _ = require('the-lodash');
const Promise = require('the-promise');

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

class Compiler
{
    constructor(src, name, values)
    {
        this._src = src;
        this._name = name;
        this._values = values;
        this._verbose = false;
        if (!this._values) {
            this._values = {};
        }
    }

    enableVerboseOutput()
    {
        this._verbose = true;
    }

    compile()
    {
        return new Promise((resolve, reject) => {
            try
            {
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

                if (this._verbose) 
                {
                    console.log(">>>>>>> SCRIPT BEGIN >>>>>>>>")
                    console.log(finalSrc)
                    console.log("<<<<<<<< SCRIPT END <<<<<<<<<")
                }
                    
                m._compile(finalSrc, this._name);
            
                var runnable = new RunnableScript(m, this._values);
                resolve(runnable);
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

class RunnableScript
{
    constructor(m, values)
    {
        this._m = m;
        this._values = values;
    }

    run(valuesMap)
    {
        valuesMap = valuesMap || {};
        return new Promise((resolve, reject) => {
            try
            {
                var result = null;
                var paramValues = [];
                paramValues = _.concat(paramValues, _.keys(PARAMS_TO_HIDE).map(x => undefined));

                for(var key of _.keys(this._values))
                {
                    if (key in valuesMap)
                    {
                        paramValues.push(valuesMap[key]);
                    }
                    else
                    {
                        paramValues.push(this._values[key]);
                    }
                }
        
                // console.log(paramValues)
                result = this._m.exports.apply(null, paramValues);
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