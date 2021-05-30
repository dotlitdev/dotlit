import React from 'react'
import { ExternalLinkIcon, AnchorIcon } from '../Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const href = props.node.properties.href
    const data = props.data
    const wikilink = props.wikilink ? 'true' : undefined
    const icon = (data && data.isExternal) 
                 ? '↗'
                 : (data && data.isFragment)
                   ? '§'
                   : null

    console.log("<Link/>", title, href)

    const imgOnlyLink = props.node.children
                        && props.node.children.length === 1
                        && props.node.children[0].tagName === 'img'

    return <a className={props.className}
        {...props.node.properties}
        wikilink={wikilink}>
            {props.children}
            {icon && !imgOnlyLink && <span className="linkIcon">{icon}</span> }
        </a>
}

export default Link
