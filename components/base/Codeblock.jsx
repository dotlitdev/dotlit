import React from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import Highlight from 'react-highlight.js'
import CodeMeta from '../CodeMeta'
const console = getConsoleForNamespace('codeblocks')


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
                { meta && <CodeMeta meta={meta}/> }
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