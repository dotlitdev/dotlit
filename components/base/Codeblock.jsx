import React from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import Highlight from 'react-highlight.js'
const console = getConsoleForNamespace('codeblocks')

class Meta extends React.Component {
    render() {
        return <span className="meta">
            <span className="lang">{this.props.meta.lang}</span>
            <span className="repl">{this.props.meta.repl}</span>
            <span className="filename">{this.props.meta.filename}</span>

            {this.props.meta.tags && <ul className="tags">{
                this.props.meta.tags.map( (tag, i) => <li key={tag+i}><span className="tag">{tag}</span></li>)
            }</ul>}

            {this.props.meta.directives && <ul className="directives">{
                this.props.meta.directives.map( (dir, i) => <li key={dir+1}><span className="directive">{dir}</span></li>)
            }</ul>}
        </span>
    }
}

const viewers = {
  csv: val => {
    // return <pre>//CSV Viewer\n{val}</pre>

    const rows = val.split("\n").map( (row,i) => {
       const cols = row.split(",").map( (col,j) => <td key={j}>{col}</td>)
       return <tr key={i}>{cols}</tr>
    })

    return <table>{rows}</table>
  },
  html: val => <div dangerouslySetInnerHTML={{__html: val}}></div>,
  svg: val => <div dangerouslySetInnerHTML={{__html: val}}></div>,
  uri: val => <iframe src={val}></iframe>,
}

const getViewer = meta => {
  return meta && (meta.isOutput || (meta.directives && meta.directives.indexOf('inline') >= 0)) && viewers[meta.lang]
}

export default class Codeblock extends React.Component {
    render() {
        
        const codeNode = this.props.node.children
                            && this.props.node.children.length == 1
                            && this.props.node.children[0].tagName === 'code'
                            ? this.props.node.children[0] 
                            : null;
        const meta = codeNode ? codeNode.properties.meta : null
        const viewer = getViewer(meta)
       
        if (codeNode) {const source = codeNode.children[0].value
            console.log("[Codeblock]", meta)
            return <codecell>
                { meta && <Meta meta={meta}/> }
                { viewer 
                  ? viewer(source)
                  : meta && meta.isOutput
                    ? <output><Highlight language={meta.lang}>{source}</Highlight></output>
                    : <Highlight language={meta.lang}>{source}</Highlight> }
            </codecell>
        } else {
            console.log("Default codeblock", this.props.node.children[0])
            return <codecell><pre>{this.props.children}</pre></codecell>
        }
    }
}