import React, {useState} from "react"
import source from 'unist-util-source'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'


const childIs = (node, nodeType) => node.children 
    && node.children.length
    && node.children[0] 
    && node.children[0].tagName === nodeType

const Cell = props => {

    const symbol = props.node.properties['data-symbol']
    const node = props.node

    const [src, setSrc] = useState('')
    const [editing, setEditing] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => symbol === ctx.selectedCell
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        ctx.setSelectedCell(selected ? null : symbol)
    }
    
    const posstr = pos => `${pos.line}:${pos.column}-${pos.offset}`
    const isCodeCell = childIs(props.node, 'pre')

    const save = ctx => args => {
        ctx.setSrc(props.node.position, src)
        setEditing(false)
    }

    const getClasses = ctx => [
        isSelected(ctx) ? 'selected' : '',
        editing ? 'editing' : '',
        isCodeCell ? 'code' : '',
    ].join(' ').trim()

    return <SelectionContext.Consumer>
        { ctx => {
            return <cell
                onClick={toggleSelected(ctx)}
                start={posstr(node.position.start)}
                end={posstr(node.position.end)}
                className={getClasses(ctx)}>
                    { editing ? <Editor src={source(props.node.position, ctx.src)} update={setSrc}/> : props.children }
                    { isSelected(ctx) && <CellMenu editing={editing} toggleEditing={toggleEditing} save={save(ctx)}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell
