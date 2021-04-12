import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'
import {btoa, atob } from '../utils/safe-encoders'

const console = getConsoleForNamespace('extractViewers')

export const extractViewers = ({fs} = {}) => {
    return async (tree,file) => {
        console.log("[ExtractViewers] Checking for custom viewers")
        for (const block of selectAll("code", tree)) {
            if (block.data 
                && block.data.meta 
                && block.data.meta.directives
                && block.data.meta.directives.indexOf('viewer') >= 0) {
                
                console.log('Found Viewer', block)
                file.data = file.data || {}
                file.data.viewers = file.data.viewers || {}
                try {
                    file.data.viewers[block.data.meta.of] 
                    = await import(/* webpackIgnore: true */ `data:text/javascript;base64,${ btoa(block.value)}`)
                } catch(err) {
                    console.log("Failed to init viewer", err)
                    const msg = "Viewer Error: " + (err.message || err.toString())
                    file.data.viewers[block.data.meta.of] 
                     = () => msg
                    file.message(msg)
                }
            }
        }
    }
}
