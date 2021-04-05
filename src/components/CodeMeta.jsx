import React from 'react'

export const CodeMeta = props => {
        return <span className="meta">
            <span className="lang">{props.meta.lang}</span>
            <span className="repl">{props.meta.repl}</span>
            <span className="filename">{props.meta.filename}</span>

            {props.meta.tags && <ul className="tags">{
                props.meta.tags.map( (tag, i) => <li key={tag+i}><span className="tag">{tag}</span></li>)
            }</ul>}

            {props.meta.directives && <ul className="directives">{
                
props.meta.directives.map( (dir, i) => <li key={dir+1}><span className="directive">{dir}</span></li>)
            }</ul>}
        </span>
}
