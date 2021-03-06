import React from 'react'

class Meta extends React.Component {
    render() {
        return <span className="meta">
            {this.props.meta.filename}.{this.props.meta.lang} { this.props.meta.tags.join(',') }
        </span>
    }
}

export default class Codeblock extends React.Component {
    render() {
        
        const codeNode = this.props.node.children
                            && this.props.node.children.length == 1
                            && this.props.node.children[0].type === 'code'
                            ? this.props.node.children[0] 
                            : null;
        
        
        if (codeNode) {
            console.log("Code block", codeNode.properties.meta )
            return <div className="LitCode">
                { codeNode.properties.meta && <Meta meta={codeNode.properties.meta}/> }
                <pre>{this.props.children}</pre>
            </div>
        } else {
            return <pre>{this.props.children}</pre>
        }
    }
}
