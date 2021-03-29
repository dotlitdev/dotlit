import React, {useState} from 'react'
import path from 'path'

import SelectionContext from './SelectionContext'
import patchSource from '../utils/unist-util-patch-source'
import {writeFileP} from '../utils/fs-promises-utils'

const App = ({file, fs, result}) => {

    const [src, setSrc] = useState(file.contents.toString())
    const [selectedCell, setSelectedCell] = useState(null)
    const writeFile = writeFileP(fs)
    
    const setSrcWrapper = async (pos, cellSource) => {
        const patchedSrc = patchSource(src, pos, cellSource)
        await writeFile(file.path, patchedSrc, {encoding: 'utf8'})
        setSrc(patchedSrc)
    }

    const state = {src, selectedCell, setSelectedCell, setSrc: setSrcWrapper}

    return <SelectionContext.Provider value={state}>
        <div id="content">{result}</div>
    </SelectionContext.Provider>
}

export default App
