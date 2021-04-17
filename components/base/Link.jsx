import React from 'react'
import { ExternalLinkIcon } from '../Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const data = props.data
    const wikilink = props.wikilink ? 'true' : undefined
    const icon = (data && data.isAbsolute) 
                 ? <ExternalLinkIcon/>
                 : (data && data.isFragment)
                   ? <AnchorIcon/>
                   : null

    console.log("<Link/>", title, props)

    return <a className={props.className}
        href={props.href}
        title={title}
        wikilink={wikilink}>
            {props.children}
            {icon && <span className="linkIcon">{icon}</span> }
        </a>
}

export default Link
