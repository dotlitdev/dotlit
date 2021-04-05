import React from 'react'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    console.log("<Link/>", props)
    return <a className={props.className}
        href={props.href}
        title={title}
        wikilink={props.wikilink ? 'true' : undefined}>
            {props.children}
        </a>
}

export default Link