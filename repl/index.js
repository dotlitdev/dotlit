import util from 'util'
import {transformSync} from '@babel/core'

import presetReact from "@babel/preset-react"
import presetTypescript from "@babel/preset-typescript"
import pluginTransformModulesCommonjs from '@babel/plugin-transform-modules-commonjs'
// import pluginBareImportRewrite from 'babel-plugin-bare-import-rewrite'

const NoOp = () => {}

function wrapConsole(console, stdoutUpdate) {
    const originalConsole = console
    let buffer = []
    const wrapConsoleMethod = (method) => {
        return (...args) => {
            const pretty = args.map( a => typeof a === 'string' ? a : util.inspect(a,{maxStringLength: 20} ) )
            // pretty.unshift(`[${method}] `)
            buffer.push(pretty);
            stdoutUpdate(buffer.join('\n'))
            originalConsole.log('vvv Wrapped console vvv', method, pretty)
            return originalConsole[method](...args)
        }
    }

    const fakeConsole = {};

    ['log', 'debug', 'error', 'warn', 'info'].forEach( m => {
        fakeConsole[m] = wrapConsoleMethod(m)
    })
    return { console: fakeConsole, buffer }
}


function isPromise(obj) {
    return obj && typeof obj.then === 'function'
}

export const transform = (filename, source, {type} = {}) => {

    const plugins = []
    if (type === 'commonjs') plugins.push(pluginTransformModulesCommonjs)
    // if (type === 'web') plugins.push(pluginBareImportRewrite)
    const babel = transformSync(source, { 
        filename: filename,
        sourceMaps: false,
        parserOpts: { allowReturnOutsideFunction: true },
        presets: [
            presetReact,
            presetTypescript
        ],
        plugins: plugins,
    })

    return babel
}

export class Repl {
    constructor(){
        this.executions = {}

        window.onerror = (msg, url, lineNo, columnNo, err) => {
            // const [, filename, line, column ] = err.stack.match(/\/([\/\w-_\.]+\.js):(\d*):(\d*)/)
            
            if (this.executions[url] ) {
                console.error('Uncaught Global error', {err, stack: msg + `\n    ${this.executions[url].filename}[${lineNo}:${columnNo}]` })
                this.executions[url].err = err
                console.log('stopping propagation of repl execution', this.executions[url])
                this.executions[url].cb(err)
                return true
            } else {
                console.error('Uncaught Global error', {err, stack: msg + `\n    ${url}[${lineNo}:${columnNo}]` })
            }
        }

        window.addEventListener("unhandledrejection", event => {
            console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
        });
    }

    formatStack(err, src) {
        if (!err.stack) return err.toString()

        const filename = this.executions[src].filename
        const source = this.executions[src].source
        const sourceLen = source.length
    
        const srcRegex = new RegExp(src, 'g')
        let stack = err.stack
            .replace(srcRegex, filename)
            .split('\n')
        
        if (stack[0] !== err.toString()) {
            // Add missing error message to stack (safari)
            stack.unshift(err.toString)
        }
        
        return stack.map( line => {
            const lineNoRegex = new RegExp(`(.*${filename}:)(\d+)(.*)`)
            const match = line && line.match && line.match(lineNoRegex)
            if (match) {
                const num = parseInt(match[2])
                // skip first and last lines (wrapper code)
                if (num === 1 || num >= sourceLen) return '' 
                else return `${match[1], num - 1, match[3]}`
            } else {
                console.log("formatStack line match fallback", typeof line, line)
                return `${line}`
            }
        }).filter(x => x).join('\n')
    }

    injectScript(source, {config, filename, ast, stdoutUpdate}) {
        const self = this
        return new Promise((resolve, reject) => {
    
            const script = document.createElement('script');
            const execId = `litExec_${Date.now()}_${Math.random()}`

            const esm = ({raw}, ...vals) => URL.createObjectURL(new Blob([String.raw({raw}, ...vals)], {type: 'text/javascript'}));
            const wrappedConsole = wrapConsole(window.console, stdoutUpdate)

            try {
                if(config && config.babel) {
                const babel = transform(filename, source)
                console.log("[babel] transformed", babel)
                source = babel.code
                }
            } catch (err) {
                console.error("[babel] Transpile failed", err)
                reject({
                    err: err, 
                    resp:  null, 
                    stdout: err.toString()
                })
            }

            const wrappedSrc = `(function(ast,console){/*${execId}*/let error; const cb = window['${execId}'].cb; const resp = (function(){ try {
                ${source}
                } catch(err) { error = true; cb(err) } }).call(window['${execId}'].context.ast); if (!error) cb(null, resp);})(window['${execId}'].context.ast, window['${execId}'].context.console)`
            const src = esm`${wrappedSrc}`

            this.executions[src] = window[execId] = {
                execId, 
                source, 
                filename, 
                stdout: wrappedConsole.buffer, 
                err: undefined, 
                resp: undefined, 
                cb: (err, resp) => {
                    console.log("pJaxCallback: ", err, resp)

                    let error = err || (this.executions[src] && this.executions[src].err)
                    if (error) {
                        const formattedError = this.formatStack(err, src)
                        this.executions[src].stdout.push(formattedError)
                        console.error('REPL ERR: ', this.executions[src])
                        reject({
                            err: error, 
                            resp:  resp, 
                            stdout: this.executions[src].stdout.join('\n')
                        })
                    } else {

                        if (isPromise(resp)) {
                            resp.then( (result) => {
                                this.executions[src].result = result
                                const pretty = (typeof result === 'string' ? result : util.inspect(result, {depth: 2}))
                                this.executions[src].stdout.push(pretty)
                                console.log('REPL DONE: ', filename, this.executions[src])
                                resolve({
                                    err: error, 
                                    resp:  result, 
                                    stdout: this.executions[src].stdout.join('\n')
                                })
                            })
                        } else {
                            this.executions[src].resp = resp
                            const pretty = (typeof resp === 'string' ? resp : util.inspect(resp, {depth: 2}))
                            this.executions[src].stdout.push(pretty)
                            console.log('REPL DONE: ', filename, this.executions[src])
                            resolve({
                                err: error, 
                                resp:  resp, 
                                stdout: this.executions[src].stdout.join('\n')
                            })
                        }
                    }
                },
                context: { console: wrappedConsole.console, ast }
            }            
    
            script.type = 'module'
            script.async = true;
            script.crossorigin = "use-credentials"
            script.src = src
            
            // script.addEventListener('load', resolve);
            script.addEventListener('error', (ev) => { console.error('script.onerror: ' + ev.message + " (" + ev.filename + ":" + ev.lineno + ")", ev); reject('Error loading script.') } );
            script.addEventListener('abort', (ev) => { console.log('script.onabort: ' + ev.message + " (" + ev.filename + ":" + ev.lineno + ")", ev); reject('Script loading aborted.') } );
            document.head.appendChild(script);
           
            
        });
    }



    exec(source, config, ast, stdoutUpdate = NoOp) {
        console.log('REPL: ', config.repl)

        const filename = config.filename || ('untitled.' + config.lang)
        return this.injectScript(source, {config, filename, ast, stdoutUpdate})
    }
}
