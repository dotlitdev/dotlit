import React from 'react'
import { ExternalLinkIcon, AnchorIcon } from '../Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const href = props.node.properties.href
    const data = props.data || {}
    const wikilink = props.wikilink ? 'true' : undefined
    const fragment = data.fragment || href[0] === '#'
    const local = !fragment && !data.external
    const external = data.external || /^https?:\/\//.test(href)

    const icon = external
                 ? <ExternalLinkIcon />
                 : fragment
                   ? '§'
                   : null

    const classNames = [
        props.className,
        data.exists && 'exists',
        local && 'local',
        data.external && 'external',
        fragment && 'fragment',
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
