import React, {useState} from 'react'
import path from 'path'
import App from './App'
import Backlinks from './Backlinks'

const Document = props => {
    return <html>
        <head>
            <title>{props.title}</title>
            <meta name="litsrc" value={props.path}/>
            <meta name="litroot" value={props.root}/>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
            <link rel="stylesheet" href={path.join(props.root, 'style.css')}/>
            <script src="//cdn.jsdelivr.net/npm/eruda"></script>
            <script>eruda.init();</script>
            <script src={path.join(props.root, 'web.bundle.js')}/>
        </head>
        <body>
            <div id="app"><App {...props}/> </div>
            <div id="backlinks"><Backlinks root={props.root} links={props.backlinks || []}/></div>
        </body>
    </html>
}

export default Document
