import React from 'react'
import {Time} from './Time'
import { stringToHex, pickTextColorBasedOnBgColor } from '../utils/colors'

const colorStyle = (val) => {
    let bgColor = stringToHex(val)
    let textColor = pickTextColorBasedOnBgColor(bgColor, 'white', 'black')

    // Custom exceptions
    if (val === 'error')  {
        bgColor = 'red',
        textColor = 'white'
    }

    return {
        color: textColor,
        backgroundColor: bgColor
    }
}

export const CodeMeta = ({meta, toggleFullscreen, toggleLocalRemote, toggleCollapsed}) => {

        return <span className="meta">
            <span className="lang" onClick={toggleCollapsed}>{meta.lang}</span>
            {meta.repl && <span className="repl">{meta.repl}</span> }
            {meta.filename && <span className="filename">{meta.filename}</span>}
            {meta.fromSource && <span onClick={toggleLocalRemote} className="source">{'< ' + meta.fromSource}</span> }
            {meta.hasOutput && <span className="output">{'> ' + meta.output}</span> }
            {meta.tags && meta.tags.map( (tag, i) => <span key={tag+i} style={colorStyle(tag)} className="tag">{tag}</span>)}
            {meta.directives && meta.directives.map( (dir, i) => {
                const onClick = dir === 'inline' ? toggleFullscreen : null
                return <span key={dir} onClick={onClick} style={colorStyle(dir)} className={`directive dir-${dir}`}>{dir}</span>
            })}
            { meta.attrs && Object.keys(meta.attrs).map(attr => {
                const val = meta.attrs[attr]
                // ignored attributes for display
                if(val===true || val==="true" || attr==="updated" || attr==="repl") return null
                return <span className={`attribute attr-${attr}`} key={attr} style={colorStyle(attr)}>{`${attr}=${val}`}</span>
                })}
            { meta.updated && <span className="updatedAt">Updated <Time ms={parseInt(meta.updated)} /></span> }
        </span>
}
