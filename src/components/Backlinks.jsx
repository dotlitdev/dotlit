import React from 'react'
import path from 'path'

export default class Backlinks extends React.Component {
    render() {
        return <>
            <h4>Backlinks ({this.props.links.length})</h4>
            <ol>
                {this.props.links.map( (link) => {
                    return  <li><a title={link.title} href={path.join(this.props.root, link.url)}>{link.title}</a></li>
                })}
            </ol>
        </>
    }
}
