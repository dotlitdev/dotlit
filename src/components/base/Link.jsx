import React from 'react'
import { Icon } from './Icons'
import { getConsoleForNamespace } from '../../utils/console'

const console = getConsoleForNamespace('Link')

const Link = props => {
    const title = props.node.properties.title
    const icon = ''

    console.log("<Link/>", title, props)

    return <a className={props.className}
        href={props.href}
        title={title}
        wikilink={props.wikilink ? 'true' : undefined}>
            { icon && <Icon name={icon}/>
            {props.children}
        </a>
}

export default Link
