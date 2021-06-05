import React from 'react'
import path from 'path'

export default class Backlinks extends React.Component {
    render() {

        const included = {}
        const deduped = this.props.links.filter( l => {
          if (!included[l.url]) {
             included[l.url] = true
             return true
          }
        })
        return <>
            <h4>{`Backlinks (${deduped.length})`}</h4>
            <ol>
                {deduped.map( (link) => {
                    return  <li key={link.url}><a title={link.title} href={path.join(this.props.root, link.url)}>{link.title}</a></li>
                })}
            </ol>
        </>
    }
}
