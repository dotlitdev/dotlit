import React, {useState} from "react"
import source from 'unist-util-source'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'

const Cell = props => {

    const symbol = props.node.properties['data-symbol']

    const [editing, setEditing] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => symbol === ctx.selectedCell
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        if (!selected) ctx.setSelectedCell(symbol)
    }

    

    return <SelectionContext.Consumer>
        { ctx => {
            console.log("Cell src:", props.node, props.node.position, source(props.node.position, ctx.src), ctx.src.length)
            return <cell
                onClick={toggleSelected(ctx)}
                className={isSelected(ctx) ? 'selected': ''}>
                    { editing ? <Editor src={source(props.node.position, ctx.src)} update={ctx.setSrc}/> : props.children }
                    { isSelected(ctx) && <CellMenu editing={editing} toggleEditing={toggleEditing}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell