import React from 'react'

export default class CodeMeta extends React.Component {
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
