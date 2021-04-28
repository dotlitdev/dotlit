import React, {useState} from 'react'
import path from 'path'
import SelectionContext from './SelectionContext'
import { Header } from './Header'
import Editor from './Editor'
import Highlight from 'react-highlight.js'
import source from 'unist-util-source'
import patchSource from '../utils/unist-util-patch-source'
import { processor } from '../renderer'
import { getConsoleForNamespace } from '../utils/console'
import filter from 'unist-util-filter'
import { atPos } from '../utils/unist-util-select-position'
import { selectAll } from 'unist-util-select'
import { posstr } from '../utils/functions'

const console = getConsoleForNamespace('App')

const App = ({root, file, fs, result}) => {

    const [srcAndRes, setSrcAndRes] = useState({
        src: file.contents.toString(),
        res: result
    })

    const [res, setResult] = useState(result)
    const [selectedCell, setSelectedCell] = useState(null)
    const [viewSource, setViewSource] = useState(false)
    const toggleViewSource = () => setViewSource(!viewSource)
    
    const setSrcWrapper = async (pos, cellSource) => {
        console.log("<App/> Set src wrapper", pos, cellSource)
        const patchedSrc = patchSource(srcAndRes.src, pos, cellSource.trimEnd())
        
        file.contents = patchedSrc
        file.messages = []
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
            const meta = codeCell.data && codeCell.data.meta && codeCell.data.meta
            const filename = meta && meta.filename
            const extract = filename && meta.isOutput && meta.extract !== 'false'
            const content = source(codeCell.position, patchedSrc).split('\n').slice(1,-1).join('\n')
            if (extract) {
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

    const setSelectedCellWrapper = (pos, scroll) => {
        console.log("Selected Cell:", pos)
        setSelectedCell(pos)
        if (pos && scroll) {
            document.querySelector(`[startpos="${posstr(pos.start)}"]`).scrollIntoViewIfNeeded()
        }
    }

    const state = {
        fs: fs,
        file: file,  
        src: srcAndRes.src, 
        selectedCell, 
        setSelectedCell: setSelectedCellWrapper, 
        setSrc: setSrcWrapper
    }

    const times = file  
        && file.data 
        && file.data.times

    console.log(`<App/> render "${file.path}" (selected: ${selectedCell} `)

    return <SelectionContext.Provider value={state}>
        <Header root={root} file={file.path} {...times} toggleViewSource={toggleViewSource}/>
        <div id="content">
          { viewSource 
            // ? <Editor src={srcAndRes.src} update={()=>{}} />
            ? <Highlight language="md">{srcAndRes.src}</Highlight>
            : srcAndRes.res }
        </div>
    </SelectionContext.Provider>
}

export default App
