import React, {useState} from 'react'
import path from 'path'
import App from './App'
import Backlinks from './Backlinks'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('Document')

const Document = props => {

    const result = props.file.result
    const title = props.file.data.frontmatter.title || props.file.stem
    const theme = props.file.data.frontmatter.theme

    return <html>
        <head>
            <title>{title}</title>
            <meta name="litsrc" value={props.file.data.canonical}/>
            <meta name="litroot" value={props.root}/>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
            {theme && <link rel="stylesheet" href={theme}/>}
            <link rel="stylesheet" href={path.join(props.root, 'style.css')}/>
        </head>
        <body>
            <div id="lit-app"><App root={props.root} file={props.file} fs={props.fs} result={result} ssr={true}/></div>
            <div id="backlinks"><Backlinks root={props.root} links={props.backlinks || []}/></div>
            <script src="//cdn.jsdelivr.net/npm/eruda"></script>
            <script>eruda.init();</script>
            <script async src={path.join(props.root, 'web.bundle.js')}/>
        </body>
    </html>
}

export default Document
