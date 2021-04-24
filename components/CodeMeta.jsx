import React from 'react'
import {Time} from './Time'
import { stringToHex, pickTextColorBasedOnBgColor } from '../utils/colors'

const colorStyle = (val) => {
    const bgColor = stringToHex(val)
    const textColor = pickTextColorBasedOnBgColor(bgColor, 'white', 'black')
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
            {meta.tags && <ul className="tags">{
               meta.tags.map( (tag, i) => <li key={tag+i} style={colorStyle(tag)}>
                   <span className="tag">{tag}</span>
               </li>)
            }</ul>}
            {meta.directives && <ul className="directives">{
                meta.directives.map( (dir, i) => {
                    const onClick = dir === 'inline' ? toggleFullscreen : null
                    return <li key={dir} onClick={onClick} style={colorStyle(dir)}>
                       <span className={`directive dir-${dir}`}>{dir}</span>
                    </li>
                })
            }</ul>}
            { meta.attrs && <ul className="attributes">{
                Object.keys(meta.attrs).map(attr => {
                    const val = meta.attrs[attr]
                    // ignored attributes for display
                    if(val===true || val==="true" || attr==="updated") return null
                    return <li key={attr} style={colorStyle(attr)}>
                         <span className={`attribute attr-${attr}`}>{`${attr}=${val}`}</span>
                    </li>
                 })
            }</ul>}
            { meta.updated && <span className="updatedAt">Updated <Time ms={parseInt(meta.updated)} /></span> }
        </span>
}
