import React, {useState} from "react"
import source from 'unist-util-source'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'

import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('Cell')

const childIs = (node, nodeType) => (node && node.children 
    && node.children.length
    && node.children[0] 
    && node.children[0].tagName === nodeType) ? node.children[0] : null

    const posstr = pos => pos ? `${pos.line}:${pos.column}-${pos.offset}` : undefined;

const Cell = props => {

    const node = props.node
    node.position = node.position || {}
    const pos = node.position
    const symbol = posstr(pos.start)

    const [src, setSrc] = useState('')
    const [editing, setEditing] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => {
        return ctx.selectedCell
            && ctx.selectedCell.start && ctx.selectedCell.end
            && ctx.selectedCell.start.line === pos.start.line
            && ctx.selectedCell.end.line === pos.end.line
    }
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        console.log(`Toggle selected (was ${selected})`, ctx.selectedCell)
        ctx.setSelectedCell(selected ? null : pos)
    }
    

    const isCodeCell = childIs(props.node, 'pre')
    const codeNode = childIs(isCodeCell, 'code');
    const meta = codeNode ? codeNode.properties.meta : null
    const codeSource = codeNode && codeNode.data && codeNode.data.value
    const rawSource = codeSource && ("```" + (meta.raw || '') + "\n" + codeSource + "\n```")
    const originalSource = codeSource 
             && codeNode.properties
             && codeNode.properties.data
             && codeNode.properties.data.originalSource 

    const content = props.children

    const save = ctx => args => {
        console.log("Saving cell", pos, src)
        ctx.setSrc(pos, src)
        setEditing(false)
    }

    const getClasses = ctx => [
        isSelected(ctx) ? 'selected' : '',
        editing ? 'editing' : '',
        isCodeCell ? 'code' : '',
    ].join(' ').trim() || undefined

    return <SelectionContext.Consumer>
        { ctx => {
            console.log("[Cell] code: ", !!isCodeCell, meta && meta.raw )//, codeNode, {src: codeSource, orig: originalSource}, ctx ) // meta, codeSource)
            const src = (meta && meta.remote && rawSource)
                        || source(pos, ctx.src)
            return <cell
                onClick={toggleSelected(ctx)}
                startpos={posstr(pos.start)}
                endpos={posstr(pos.end)}
                className={getClasses(ctx)}>
                    { editing ? <Editor src={src} update={setSrc}/> : content }
                    { isSelected(ctx) && <CellMenu meta={meta} editing={editing} toggleEditing={toggleEditing} save={save(ctx)}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell
