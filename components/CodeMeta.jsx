import React from 'react'

export const CodeMeta = ({meta}) => {
        return <span className="meta">
            <span className="lang">{meta.lang}</span>
            {meta.repl && <span className="repl">{meta.repl}</span> }
            {meta.filename && <span className="filename">{meta.filename}</span>}
            {meta.fromSource && <span className="source">{'< ' + meta.fromSource}</span> }
            {meta.tags && <ul className="tags">{
               meta.tags.map( (tag, i) => <li key={tag+i}><span className="tag">{tag}</span></li>)
            }</ul>}
            {meta.directives && <ul className="directives">{
                meta.directives.map( (dir, i) => <li key={dir+1}><span className="directive">{dir}</span></li>)
            }</ul>}
        </span>
}
