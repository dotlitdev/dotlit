import React, {useState} from "react"
import source from 'unist-util-source'
import patchSource from '../utils/unist-util-patch-source'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'

const Cell = props => {

    const symbol = props.node.properties['data-symbol']
    const [srcGetter, setSrcGetter] = useState(()=>{})

    const [editing, setEditing] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => symbol === ctx.selectedCell
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        ctx.setSelectedCell(selected ? null : symbol)
    }

    const save = ctx => args => {
        const src = srcGetter()
        ctx.setSrc(patchSource(ctx.src, props.node.position, src))
    }

    const updateSrc = (value) => {
        setSrc(value)
    }

    const getState = (getter) => {
        setSrcGetter(getter)
    }


    return <SelectionContext.Consumer>
        { ctx => {
            const src = source(props.node.position, ctx.src)
            return <cell
                onClick={toggleSelected(ctx)}
                className={[ isSelected(ctx) ? 'selected' : '', editing ? 'editing' : ''].join(' ')}>
                    { editing ? <Editor src={src} getState={getState}/> : props.children }
                    { isSelected(ctx) && <CellMenu editing={editing} toggleEditing={toggleEditing} save={save}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell