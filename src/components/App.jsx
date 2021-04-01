import React, {useState} from 'react'
import SelectionContext from './SelectionContext'
import patchSource from '../utils/unist-util-patch-source'
import { processor } from '../renderer'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('App')

const App = ({file, fs, result}) => {

    const [src, setSrc] = useState(file.contents.toString())
    const [res, setResult] = useState(result)
    const [selectedCell, setSelectedCell] = useState(null)
    
    const setSrcWrapper = async (pos, cellSource) => {
        console.log("<App/> Set src wrapper", pos, cellSource)
        const patchedSrc = patchSource(src, pos, cellSource)
        

        try {
            await fs.writeFile(file.path, patchedSrc, {encoding: 'utf8'})
        } catch (err) {
            console.log("Failed to write file source to fs", file.path, err)
        }

        setSrc(patchedSrc)
        file.contents = patchedSrc
        const processedFile = await processor(fs).process(file)
        console.log("Processed client", processedFile)
        setResult(processedFile.result)
    }

    const state = {src, selectedCell, setSelectedCell, setSrc: setSrcWrapper}

    console.log('<App/> render', res, src, setSelectedCell)

    return <SelectionContext.Provider value={state}>
        <div id="content">{res}</div>
    </SelectionContext.Provider>
}

export default App
