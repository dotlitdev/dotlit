import React, {useState} from 'react'
import path from 'path'

import SelectionContext from './SelectionContext'
import patchSource from '../utils/unist-util-patch-source'

const App = ({file, fs, processor}) => {

    const [src, setSrc] = useState(file.contents.toString())
    const [selectedCell, setSelectedCell] = useState(null)

    const writeFileP = async (...args) => {
        const filepath = args[0] = "/" + args[0]
        const p = path.parse(filepath)
        const parts = p.dir.split(path.sep)
        console.log(`"Parts for "${filepath}"`, parts)
        for (var i=0; i<parts.length; i++) {
            console.log(`[${i}] <--- "${parts[i]}"`)
            if (i === 0) {}
            else {
                const subPath = parts.slice(0, i  + 1).join(path.sep)
                console.log(`"${subPath}" Sub path`)
                try { 
                    await fs.stat(subPath)
                    console.log(`"${subPath}" Existed, skipping`)
                } catch (err) { 
                    console.log(`"${subPath}" Didnt exist, creating...`)
                    await fs.mkdir(subPath) }
            }
        }
        console.log("Writing file", ...args)
        return fs.writeFile(...args)
    }
    
    const setSrcWrapper = async (pos, cellSource) => {
        const patchedSrc = patchSource(src, pos, cellSource)
        await writeFileP(file.path, patchedSrc, {encoding: 'utf8'})
        setSrc(patchedSrc)
    }

    const state = {src, selectedCell, setSelectedCell, setSrc: setSrcWrapper}
    const processed = processor.processSync(src)
    console.log('Processed: ', processed)
    const result = processed.result

    return <SelectionContext.Provider value={state}>
        <div id="content">{result}</div>
    </SelectionContext.Provider>
}

export default App
