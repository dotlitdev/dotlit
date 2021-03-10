import React, {useState} from 'react'
import Editor from './Editor'
import SelectionContext from './SelectionContext'

const App = (props) => {
    const [src, setSrc] = useState(props.src)
    const [showEditor, setShowEditor] = useState(false)
    const [selectedCell, setSelectedCell] = useState(null)

    const toggleEditor = () => setShowEditor(!showEditor)
    const updateSrc = (newSrc) => {
        console.log('update called', newSrc)
        setSrc(newSrc)
        toggleEditor(false)
    }

    const state = {src, selectedCell, setSelectedCell, setSrc}

    return <SelectionContext.Provider value={state}>
        <div id="content">{props.processor.processSync(src).result}</div>
    </SelectionContext.Provider>
}

export default App
