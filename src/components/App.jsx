import React, {useState} from 'react'
import SelectionContext from './SelectionContext'
import patchSource from '../utils/unist-util-patch-source'
import { processor } from '../renderer'
import { getConsoleForNamespace } from '../utils/console'
import { selectAll } from 'unist-util-select'

const console = getConsoleForNamespace('App')

const atPos = pos => (node) => {
  const pos2 = node.position
  return (pos2.start.line >= pos.start.line
    && pos2.start.line <= pos.end.line)
    ||
    (pos2.end.line >= pos.start.line
     && pos2.end.line <= pos.end.line)
}

const App = ({file, fs, result}) => {

    const [srcAndRes, setSrcAndRes] = useState({
        src: file.contents.toString(),
        res: result
    })
    const [res, setResult] = useState(result)
    const [selectedCell, setSelectedCell] = useState(null)
    
    const setSrcWrapper = async (pos, cellSource) => {
        console.log("<App/> Set src wrapper", pos, cellSource)
        const patchedSrc = patchSource(srcAndRes.src, pos, cellSource.trimEnd())
        
        setSrc(patchedSrc)
        file.contents = patchedSrc
        const processedFile = await processor(fs).process(file)
        console.log("Processed client", processedFile)
        setResult(processedFile.result)

        try {
            await fs.writeFile(file.path, patchedSrc, {encoding: 'utf8'})
        } catch (err) {
            console.log("Failed to write file source to fs", file.path, err)
        }
        
        const nodes = selectAll( atPos(pos), processedFile.data.ast )
        console.log("=====> pos to nodes", pos, file.path, nodes)
        const filename = cellSource.data && cellSource.data.meta && cellSource.data.meta.filename
        if (filename) {
             const filepath = path.join( path.dirname(file.path), filename)
             await fs.writeFile(filepath, cellSource.value)
             console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
        }

       
    }

    const state = {srcAndRes.src, selectedCell, setSelectedCell, setSrc: setSrcWrapper}

    console.log('<App/> render', srcAndRes.res, srcAndRes.src, selectedCell)

    return <SelectionContext.Provider value={state}>
        <div id="content">{srcAndRes.res}</div>
    </SelectionContext.Provider>
}

export default App
