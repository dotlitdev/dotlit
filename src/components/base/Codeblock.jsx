import React from 'react'
import {log, level} from '../../utils/console'

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

export default class Codeblock extends React.Component {
    render() {
        
        const codeNode = this.props.node.children
                            && this.props.node.children.length == 1
                            && this.props.node.children[0].tagName === 'code'
                            ? this.props.node.children[0] 
                            : null;
        const meta = codeNode ? codeNode.properties.meta : null
        
        if (codeNode) {
            level(2, log)("[Codeblock]", codeNode.properties.meta )
            return <div className="LitCode">
                { meta && <Meta meta={meta}/> }
                { meta &&  meta.isOutput
                    ? <output><pre>{this.props.children}</pre></output>
                    : <pre>{this.props.children}</pre> }
            </div>
        } else {
            console.log("Default codeblock", this.props.node.children[0])
            return <pre>{this.props.children}</pre>
        }
    }
}
