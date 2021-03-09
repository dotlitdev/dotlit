import React, {useState} from 'react'
import Editor from './Editor'

const App = (props) => {
    const [src, setSrc] = useState(props.src)
    const [showEditor, setShowEditor] = useState(false)

    const toggleEditor = () => setShowEditor(!showEditor)
    const updateSrc = (newSrc) => {
        console.log('update called', newSrc)
        setSrc(newSrc)
        toggleEditor(false)
    }

    return <>
        { showEditor 
            ? <Editor src={src} update={updateSrc}/> 
            : <div id="content">{props.processor.processSync(src).result}</div>
        }
        <span onClick={toggleEditor}>Editor</span>
    </>
}

export default App
