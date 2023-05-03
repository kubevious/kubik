import _ from 'the-lodash'
import { MyPromise } from 'the-promise'
import { UnitConverter } from './unit-converter'

export interface ParamsToHide {
    [name: string]: boolean
}

const PARAMS_TO_HIDE: ParamsToHide = {
    exports: true,
    require: true,
    module: true,
    __filename: true,
    __dirname: true,
    Promise: true,
}
for (let x of _.keys(global)) {
    if (!PARAMS_TO_HIDE[x]) {
        PARAMS_TO_HIDE[x] = true
    }
}

export interface CompilerScopeDict {
    [name: string]: any
}

export class Compiler {
    private _src: string
    private _name: string
    private _values: CompilerScopeDict;
    private _verbose: boolean

    constructor(src: string, name: string, values: CompilerScopeDict) {
        this._src = src
        this._name = name
        this._values = {
            unit: new UnitConverter(),
        }
        if (values) {
            this._values = _.defaults(this._values, values)
        }
        this._verbose = false
    }

    enableVerboseOutput() {
        this._verbose = true
    }

    compile(): Promise<any> {
        return MyPromise.construct<any>((resolve, reject) => {
            try {
                let allParamNames: string[] = []
                allParamNames = _.concat(allParamNames, _.keys(PARAMS_TO_HIDE))

                for (let key of _.keys(this._values)) {
                    allParamNames.push(key)
                }

                let finalSrc =
                    'module.exports = function(' +
                    allParamNames.join(', ') +
                    ') {\n' +
                    "    'use strict';\n" +
                    this._src +
                    '\n};'

                let Module: any = module.constructor
                let m: any = new Module()

                if (this._verbose) {
                    console.log('>>>>>>> SCRIPT BEGIN >>>>>>>>')
                    console.log(finalSrc)
                    console.log('<<<<<<<< SCRIPT END <<<<<<<<<')
                }

                m._compile(finalSrc, this._name)

                let runnable = new RunnableScript(m, this._values)
                resolve(runnable)
            } catch (reason) {
                // console.log("*** ERROR: ");
                // console.log(reason);
                reject(reason)
            }
        })
    }
}

class RunnableScript {
    private _m: NodeModule
    private _values: CompilerScopeDict
    constructor(m: NodeModule, values: CompilerScopeDict) {
        this._m = m
        this._values = values
    }

    run(valuesMap: { [key: string]: any }) {
        valuesMap = valuesMap || {}
        return MyPromise.construct((resolve, reject) => {
            try {
                let result = null
                let paramValues: (string | undefined)[] = []
                paramValues = _.concat(
                    paramValues,
                    _.keys(PARAMS_TO_HIDE).map((x) => undefined)
                )

                for (let key of _.keys(this._values)) {
                    if (key in valuesMap) {
                        paramValues.push(valuesMap[key])
                    } else {
                        paramValues.push(this._values[key])
                    }
                }

                // console.log(paramValues)
                result = this._m.exports.apply(null, paramValues)
                resolve(result)
            } catch (reason) {
                // console.log("*** ERROR: ");
                // console.log(reason);
                reject(reason)
            }
        })
    }
}
