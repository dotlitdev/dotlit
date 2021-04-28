import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'
import {btoa, atob } from '../utils/safe-encoders'

const console = getConsoleForNamespace('extractViewers')
   

const extractModule = async (src, filename) => {
    var Module = module.constructor;
    var m = new Module();

    if (typeof m._compile === 'function') {
        m._compile(src, filename);
        return m.exports
    }
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
                    let viewer = extractModule(block.value, filename)
                    if (viewer.asyncViewer) viewer = await viewer.asyncViewer()
                    file.data.viewers[block.data.meta.of] = viewer
                   
                } catch(err) {
                    console.log("Failed to init viewer", err)
                    const msg = "Viewer Error: module?" + typeof module + " " + (err.message || err.toString())
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
                    let transformer = extractModule(block.value, filename )
                    if (transformer.asyncTransformer) transformer = await transformer. asyncTransformer()
                    file.data.transformers[block.data.meta.of] = transformer
                   
                } catch(err) {
                    console.log("Failed to init transformer", err)
                    const msg = "Transformer Error: " + (err.message || err.toString())
                    file.data.transformers[block.data.meta.of] 
                     = () => msg
                    file.message(msg, block)
                }
            }
        }
    }
}
