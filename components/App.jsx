import React, {useState} from 'react'
import path from 'path'
import SelectionContext from './SelectionContext'
import { Header } from './Header'
import source from 'unist-util-source'
import patchSource from '../utils/unist-util-patch-source'
import { processor } from '../renderer'
import { getConsoleForNamespace } from '../utils/console'
import filter from 'unist-util-filter'
import { atPos } from '../utils/unist-util-select-position'
import { selectAll } from 'unist-util-select'

const console = getConsoleForNamespace('App')

const App = ({root, file, fs, result}) => {

    const [srcAndRes, setSrcAndRes] = useState({
        src: file.contents.toString(),
        res: result
    })
    const [res, setResult] = useState(result)
    const [selectedCell, setSelectedCell] = useState(null)
    
    const setSrcWrapper = async (pos, cellSource) => {
        console.log("<App/> Set src wrapper", pos, cellSource)
        const patchedSrc = patchSource(srcAndRes.src, pos, cellSource.trimEnd())
        
        file.contents = patchedSrc
        const processedFile = await processor(fs).process(file)
        console.log("Processed client", processedFile)
      
        try {
            await fs.writeFile(file.path, patchedSrc, {encoding: 'utf8'})
        } catch (err) {
            console.log("Failed to write file source to fs", file.path, err)
        }
        
        const tmpEnd = {line: pos.start.line + cellSource.split('\n').length }
        const tmpPos = {start: pos.start, end: tmpEnd }
        const tree = filter(processedFile.data.ast, atPos(tmpPos))
        const nodes = selectAll('code', tree)
        console.log("[CodeCells in Change (pos)]", tmpPos, file.path, tree, nodes)
        for (const codeCell of nodes) {
            const filename = codeCell.data && codeCell.data.meta && codeCell.data.meta.filename
            const fromSource = codeCell.data && codeCell.data.meta && codeCell.data.meta.fromSource
            const content = source(codeCell.position, patchedSrc)
            if (filename && fromSource && fromSource === filename) {
                const filepath = path.join( path.dirname(file.path), filename)
                await fs.writeFile(filepath, content)
                console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
            }
       }

       setSrcAndRes({
            src: patchedSrc,
            res: processedFile.result
       })
    }

    const state = {
        fs: fs,
        file: file,  
        src: srcAndRes.src, 
        selectedCell, 
        setSelectedCell, 
        setSrc: setSrcWrapper
    }

    const times = file  
        && file.data 
        && file.data.times

    console.log(`<App/> render "${file.path}" (selected: ${selectedCell} `)

    return <SelectionContext.Provider value={state}>
        <div id="header"><Header root={root} file={file.path} {...times} /></div>
        <div id="content">{srcAndRes.res}</div>
    </SelectionContext.Provider>
}

export default App
