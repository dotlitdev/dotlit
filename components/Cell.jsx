import React from "react"

export default class Cell extends React.Component {
    render() {
        return <div className="LitCell">{this.props.children}</div>
    }
}