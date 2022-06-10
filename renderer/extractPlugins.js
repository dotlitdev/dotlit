import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'
import {btoa, atob } from '../utils/safe-encoders'
import { transform } from '../repl'

const console = getConsoleForNamespace('plugins')
   

const extractModule = async (src, filename) => {
    if (typeof global !== 'undefined'){
        var Module = module.constructor;
        var m = new Module();

        if (typeof m._compile === 'function') {
            const babel = transform(filename, src, {type: 'commonjs'})
            m._compile(babel.code, filename);
            console.log(`Compiled (${filename}) as commonjs module`, m, m.exports)
            if (m.exports && Object.keys(m.exports).length) return m.exports;
            else throw new Error("No module.exports when loaded as commonjs")
        }
        
    }
    console.log(`Importing (${filename}) as es6 module via data:uri import.`)
    // const blobUrl = URL.createObjectURL(new Blob([src], {type: 'text/javascript'}))
    // return await import(/* webpackIgnore: true */ blobUrl)
    const babel = transform(filename, src) 
    return await import(/* webpackIgnore: true */ `data:text/javascript;base64,${ btoa(babel.code)}`)
}

export const extractPlugins = ({fs} = {}) => {
    return async (tree,file) => {
        console.log("Checking for plugins")
        file.data = file.data || {}
        // file.data.plugins = {}
        const blocks = selectAll("code", tree)
        if (blocks?.length) await Promise.all(blocks.map(async block => {

            const filename = (block.data
                             && block.data.meta
                             && block.data.meta.filename) || ''
           
            // Generic plugins
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('disable') === -1
                && block.data.meta.directives.indexOf('plugin') >= 0) {
                
                const meta = block.data.meta
                const value = block.data?.value || block.value
                console.log('Found Plugin', meta.raw)
                
                let type = meta.type || 'unknown'
                const types = ['parser', 'renderer', 'transformer', 'viewer', 'unknown', 'onsave', 'onload', 'onselect', 'menu', 'data', 'setting']
                
                file.data = file.data || {}
                file.data.plugins = file.data.plugins || {}
                file.data.plugins[type] = file.data.plugins[type] || {}

                if (meta.lang === 'css') {
                     const len = Object.keys(file.data.plugins[type]).length
                     const id = meta.of || meta.id || meta.filename || len
                     file.data.plugins[type][id] = {value: value}
                     return;
                }
                
                try {
                    let plugin = await extractModule(value, filename)
                    console.log("plugin module:", plugin)
                    let foundExport;
                    if (plugin?.asyncPlugin) {
                        plugin = await plugin.asyncPlugin()
                    }
  
                    for (const type of types) {
                        if (plugin?.[type]) {
                            foundExport = true
                            file.data.plugins[type] = file.data.plugins[type] || {}
                            const len = Object.keys(file.data.plugins[type]).length
                            const id = meta.of || meta.id || meta.filename || len
                            if (file.data.plugins[type] && file.data.plugins[type][id]) {
                                console.log(`Duplicate plugin for type: ${type} id: ${id}, overwriting.`)
                            }
                            file.data.plugins[type][id] = plugin[type]
                        }
                    }
                    if (types.indexOf(type) === -1 && plugin?.[type]) {
                       file.data.plugins[type] = file.data.plugins[type] || {}
                       const len = Object.keys(file.data.plugins[type]).length
                       const id = meta.of || meta.id || meta.filename || len
                       file.data.plugins[type][id] = plugin[type]
                       foundExport = true
                    }
                    if (!foundExport) throw new Error(`No plugin exported from module. for ${block.meta}`)
                    
                   
                } catch(err) {
                    console.log("Failed to init plugin", meta.raw, err)
                    const msg = `Plugin Error (${type}): ` + (err.message || err.toString())
                    file.message(msg, block)
                }
            }
        }))
    }
}
