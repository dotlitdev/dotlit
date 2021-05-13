
import path from 'path'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'

const console = getConsoleForNamespace('transcludeCode')

export const transcludeCode = ({fs}) => {
    return async (tree,file) => {
        if(!fs) {
            console.error("not enabled no fs.")
            // return;
        };
        console.log("Checking for files to transclude")
        for (const block of selectAll("code", tree)) {
            const source = block?.data?.meta?.source
            if (source) {
                console.log("Found source to be transcluded", block.data.meta.raw)
               block.data.originalSource = block.value
               block.data.hProperties.data = {originalSource: block.value}
               if (source.uri) {
                   const resp = await fetch(source.uri)
                   if (resp.status >= 200 && resp.status < 400) {
                       const value = await resp.text()
                    //    console.log("has value", value)
                       block.value = value
                   } else {
                       const msg = "Failed to load uri " + block.data.meta.fromSource + " status: " + resp.status
                       file.message(msg, block)
                       console.error(msg)
                   }
               }
               else if (source.filename) {
                   const filePath = path.join(path.dirname(file.path), source.filename)
                   console.log("to filePath", filePath)

                   try {
                       const resp = await fs.readStat(filePath, {encoding: 'utf8'})
                    //    console.log("has value", resp)
                       block.value = resp.local.value || resp.remote.value
                   } catch(err) {
                       const msg = "Failed to load " + block.data.meta.fromSource + " as " + filePath
                       file.message(msg, block)
                       console.error(msg, err)
                   }
               }
            }
        }
    }
}
