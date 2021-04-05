export const transcludeCode = ({fs}) => {
         return async (tree,file) => {
             if(!fs) return;
             console.log("Checking for files to transclude")
             for (const block of selectAll("code", tree)) {
                 if (block.data && block.data.meta && block.data.meta.source) {
                    const source = block.data.meta.source
                    console.log("has source", source)

                    if (source.uri) {
                        const resp = await fetch(source.uri)
                        if (resp.status >= 200 && resp.status < 400) {
                            const value = await resp.text()
                            console.log("has value", value)
                            block.value = value
                        }
                    }
                    else if (source.filename) {
                        const filePath = path.join(path.dirname(file.path), source.filename)
                        console.log("to filePath", filePath)

                        try {
                            
                            const value = await fs.readFile(filePath)
                            console.log("has value", value)
                            block.value = value
                        } catch(err) {
                            file.message("Failed to load " + block.data.meta.fromSource + " as " + filePath)
                        }
                    }
                 }
             }
         }
     }