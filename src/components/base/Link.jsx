import React from 'react'
import { ExternalLinkIcon, AnchorIcon } from '../Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const href = props.node.properties.href
    const data = props.data || {}
    const wikilink = props.wikilink ? 'true' : undefined
    const icon = data.external
                 ? '↗'
                 : data.fragment
                   ? '§'
                   : null

    // console.log("<Link/>", data.exists)
    
    const local = !data.fragment && !data.external
    const classNames = [
        props.className,
        data.exists && 'exists',
        local && 'local',
        data.external && 'external',
        data.fragment && 'fragment',
    ].filter(x=>x).join(' ')

    const imgOnlyLink = props.node.children
                        && props.node.children.length === 1
                        && props.node.children[0].tagName === 'img'

    return <a className={classNames}
        {...props.node.properties}
        // {...props.node.properties.data}
        data={props.node.properties.data}
        wikilink={wikilink}>
            {props.children}
            {icon && !imgOnlyLink && <span className="linkIcon">{icon}</span> }
        </a>
}

export default Link
