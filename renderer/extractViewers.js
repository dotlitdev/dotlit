import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'
import {btoa, atob } from '../utils/safe-encoders'

const console = getConsoleForNamespace('extractViewers')
   

const extractModule = async (src, filename) => {
    if (typeof global !== 'undefined'){
        var Module = module.constructor;
        var m = new Module();

        if (typeof m._compile === 'function') {
            m._compile(src, filename);
            console.log("Compiled as commonjs module", m, m.exports)
            if (m.exports && Object.keys(m.exports).length) return m.exports;
            else throw new Error("No module.exports when loaded as commonjs")
        }
    }
    console.log("Importing as es6 module via data:uri import.")
    return await import(/* webpackIgnore: true */ `data:text/javascript;base64,${ btoa(src)}`)
}

export const extractViewers = ({fs} = {}) => {
    return async (tree,file) => {
        console.log("[ExtractViewersAndTransformers] Checking for custom viewers and transformers")
        for (const block of selectAll("code", tree)) {

            const filename = (block.data
                             && block.data.meta
                             && block.data.meta.filename) || ''
            // viewer
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('viewer') >= 0) {
                
                console.log('Found Viewer', block.meta)
                file.data = file.data || {}
                file.data.viewers = file.data.viewers || {}
                try {
                    let viewer = await extractModule(block.value, filename)
                    if (viewer.asyncViewer) {
                        viewer = await viewer.asyncViewer()
                    } else if (viewer.viewer) {
                    } else {
                        console.log(viewer)
                        throw new Error("No viewer exported from module")
                    }
                    file.data.viewers[block.data.meta.of] = viewer
                   
                } catch(err) {
                    console.log("Failed to init viewer", err)
                    const msg = "Viewer Error: " + (err.message || err.toString())
                    file.data.viewers[block.data.meta.of] 
                     = () => msg
                    file.message(msg, block)
                }
            }
            // transformer
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('transformer') >= 0) {
                
                console.log('Found Transformer', block.meta)
                file.data = file.data || {}
                file.data.transformers = file.data.transformers || {}
                try {
                    let transformer = await extractModule(block.value, filename )
                    if (transformer.asyncTransformer) transformer = await transformer.asyncTransformer()
                    else if (transformer.transformer) {
                    } else {
                        console.log(transformer)
                        throw new Error("No transformer exported from module")
                    }
                    file.data.transformers[block.data.meta.of] = transformer
                   
                } catch(err) {
                    console.log("Failed to init transformer", err)
                    const msg = "Transformer Error: " + (err.message || err.toString())
                    file.data.transformers[block.data.meta.of] 
                     = () => msg
                    file.message(msg, block)
                }
            }

            // Generic plugins
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('plugin') >= 0) {
                
                console.log('Found Plugin', block.meta)
                file.data = file.data || {}
                file.data.plugins = file.data.plugins || {}
                try {
                    let plugin = await extractModule(block.value, filename )
                    if (plugin.asyncPlugin) plugin = await plugin.asyncPlugin()
                    else if (plugin.plugin) {
                    } else {
                        console.log(plugin)
                        throw new Error("No plugin exported from module")
                    }
                    file.data.plugins[block.data.meta.id] = plugin
                   
                } catch(err) {
                    console.log("Failed to init plugin", err)
                    const msg = "Plugin Error: " + (err.message || err.toString())
                    file.data.plugins[block.data.meta.of] 
                     = () => msg
                    file.message(msg, block)
                }
            }
        }
    }
}
