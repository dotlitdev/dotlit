import React from 'react'

export class Head extends React.Component {
    render() {
        return <head>
        <title>{this.props.title}</title>
    </head>
    }
}