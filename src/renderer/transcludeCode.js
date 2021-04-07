
import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'

const console = getConsoleForNamespace('transcludeCode')

export const transcludeCode = ({fs}) => {
    return async (tree,file) => {
        if(!fs) return;
        console.log("[Transclude] Checking for files to transclude")
        for (const block of selectAll("code", tree)) {
            if (block.data && block.data.meta && block.data.meta.source) {
               const source = block.data.meta.source
               console.log("[Transclude] has source", source)
               block.data.originalSource = block.value
               if (source.uri) {
                   const resp = await fetch(source.uri)
                   if (resp.status >= 200 && resp.status < 400) {
                       const value = await resp.text()
                       console.log("[Transclude] has value", value)
                       block.value = value
                   }
               }
               else if (source.filename) {
                   const filePath = path.join(path.dirname(file.path), source.filename)
                   console.log("[Transclude] to filePath", filePath)

                   try {
                       const resp = await fs.readStat(filePath, {encoding: 'utf8'})
                       console.log("[Transclude]  has value", resp)
                       block.value = resp.local.value || resp.remote.value
                   } catch(err) {
                       file.message("[Transclude] Failed to load " + block.data.meta.fromSource + " as " + filePath)
                   }
               }
            }
        }
    }
}