import React, {useState} from "react"
import source from 'unist-util-source'
import patchSource from '../utils/unist-util-patch-source'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'

const Cell = props => {

    const symbol = props.node.properties['data-symbol']

    const [src, setSrc] = useState('')
    const [editing, setEditing] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => symbol === ctx.selectedCell
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        ctx.setSelectedCell(selected ? null : symbol)
    }

    const save = ctx => args => {
        console.log("current", src)
        console.log('original', source(props.node.position, ctx.src))
        const patchedSrc = patchSource(ctx.src, props.node.position, src)
        console.log('patched', patchedSrc)
        ctx.setSrc(patchedSrc)
        setEditing(false)
    }

    return <SelectionContext.Consumer>
        { ctx => {
            return <cell
                onClick={toggleSelected(ctx)}
                className={[ isSelected(ctx) ? 'selected' : '', editing ? 'editing' : ''].join(' ')}>
                    { editing ? <Editor src={source(props.node.position, ctx.src)} update={setSrc}/> : props.children }
                    { isSelected(ctx) && <CellMenu editing={editing} toggleEditing={toggleEditing} save={save(ctx)}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell