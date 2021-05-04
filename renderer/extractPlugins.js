import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'
import {btoa, atob } from '../utils/safe-encoders'

const console = getConsoleForNamespace('plugins')
   

const extractModule = async (src, filename) => {
    if (typeof global !== 'undefined'){
        var Module = module.constructor;
        var m = new Module();

        if (typeof m._compile === 'function') {
            return {}
        //     m._compile(src, filename);
        //     console.log("Compiled as commonjs module", m, m.exports)
        //     if (m.exports && Object.keys(m.exports).length) return m.exports;
        //     else throw new Error("No module.exports when loaded as commonjs")
        }
        
    }
    console.log("Importing as es6 module via data:uri import.")
    // const blobUrl = URL.createObjectURL(new Blob([src], {type: 'text/javascript'}))
    // return await import(/* webpackIgnore: true */ blobUrl)
    return await import(/* webpackIgnore: true */ `data:text/javascript;base64,${ btoa(src)}`)
}

export const extractPlugins = ({fs} = {}) => {
    return async (tree,file) => {
        console.log("Checking for plugins")
        file.data = file.data || {}
        // file.data.plugins = {}

        for (const block of selectAll("code", tree)) {

            const filename = (block.data
                             && block.data.meta
                             && block.data.meta.filename) || ''
           
            // Generic plugins
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('plugin') >= 0) {
                
                const meta = block.data.meta
                console.log('Found Plugin', meta)
                
                let type = meta.type || 'unknown'
                const types = ['parser', 'renderer', 'transformer', 'viewer', 'unknown']
                
                file.data = file.data || {}
                file.data.plugins = file.data.plugins || {}
                file.data.plugins[type] = file.data.plugins[type] || {}
                
                try {
                    let plugin = await extractModule(block.value, filename)
                    console.log("plugin module:", plugin)
                    let foundExport;
                    if (plugin.asyncPlugin) {
                        plugin = await plugin.asyncPlugin()
                    }

                    for (const type of types) {
                        if (plugin[type]) {
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
                    if (types.indexOf(type) === -1 && plugin[type]) {
                       file.data.plugins[type] = file.data.plugins[type] || {}
                       const len = Object.keys(file.data.plugins[type]).length
                       const id = meta.of || meta.id || meta.filename || len
                       file.data.plugins[type][id] = plugin[type]
                       foundExport = true
                    }
                    if (!foundExport) throw new Error(`No plugin exported from module. for ${block.meta}`)
                    
                   
                } catch(err) {
                    console.error("Failed to init plugin", err)
                    const msg = `Plugin Error (${type}): ` + (err.message || err.toString())
                    file.message(msg, block)
                }
            }
        }
    }
}
