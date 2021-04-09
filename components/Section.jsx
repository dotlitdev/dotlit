import React from 'react' 
import { Identity } from '../utils/functions'
import SelectionContext from './SelectionContext'

export const Section = (props) => {

    const pos = props.node.position

    const withContext = (ctx) => {

        const isSelected = ctx.selectedCell 
            && ctx.selectedCell.start
            && ctx.selectedCell.start.line >= pos.start.line
            && ctx.selectedCell.end.line <= pos.end.line

        const classes = [
            isSelected && 'selected',

        ].filter(Identity).join(' ')

        return <section
            depth={props.depth}
            className={classes}
            startpos={`${pos.start.line}:${pos.start.column}-${pos.start.offset}`}
            endpos={`${pos.end.line}:${pos.end.column}-${pos.end.offset}`}>
            {props.children}
        </section>
    }

    return <SelectionContext.Consumer>{ withContext }</SelectionContext.Consumer>
}
