import React from 'react'
import { ExternalLinkIcon } from '../Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const wikilink = props.wikilink ? 'true' : undefined
    const icon = wikilink 
                 ? null
                 : <ExternalLinkIcon/>

    console.log("<Link/>", title, props)

    return <a className={props.className}
        href={props.href}
        title={title}
        wikilink={wikilink}>
            {icon}
            {props.children}
        </a>
}

export default Link
