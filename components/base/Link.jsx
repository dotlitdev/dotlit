import React from 'react'

export default class Link extends React.Component {
    render() {
        const title = this.props.node.properties.title
        return <a className={"LitLink " + this.props.className}
            href={this.props.href}
            title={title}>
                {this.props.children}
            </a>
    }
}
