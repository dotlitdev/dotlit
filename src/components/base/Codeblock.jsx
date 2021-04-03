import React from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'

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
  csv: val => <pre>//CSV Viewer\n{val}</pre>,
  html: val => <div dangerouslySetInnerHTML={{__html: val}}></div>,
  svg: val => <svg dangerouslySetInnerHTML={{__html: val}}></svg>,
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
        
        if (codeNode) {
            console.log("[Codeblock]", codeNode.properties.meta )
            return <codecell>
                { meta && <Meta meta={meta}/> }
                { viewer 
                  ? viewer(this.props.children)
                  : meta && meta.isOutput
                    ? <output><pre>{this.props.children}</pre></output>
                    : <pre>{this.props.children}</pre> }
            </codecell>
        } else {
            console.log("Default codeblock", this.props.node.children[0])
            return <codecell><pre>{this.props.children}</pre></codecell>
        }
    }
}
