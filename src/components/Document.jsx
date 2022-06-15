import React, {useState} from 'react'
import path from 'path'
import App from './App'
import Backlinks from './Backlinks'
import { getConsoleForNamespace } from '../utils/console'
import { ServerStyleSheet } from 'styled-components';
import { renderToString } from 'react-dom/server'

const console = getConsoleForNamespace('Document')

export function createDocument (props) {

    const files = props.files || []
    const result = props.file.result
    const title = props.file.data.frontmatter.title || props.file.stem
    const theme = props.file.data.frontmatter.theme

    const sheet = new ServerStyleSheet();
    const app = renderToString(sheet.collectStyles(<>
        <div id="lit-app"><App root={props.root} file={props.file} fs={props.fs} result={result} files={files} ssr={true} /></div>
        <div id="backlinks"><Backlinks root={props.root} links={props.backlinks || []}/></div>
    </>))

    const styles = sheet.getStyleTags()

    return `<html>
        <head>
            <title>${title}</title>
            <meta name="litsrc" value="${props.file.data.canonical}"/>
            <meta name="litroot" value="${props.root}"/>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
            ${theme ? `<link rel="stylesheet" href="${theme}"/>` : ''}
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <link rel="apple-touch-icon" href="${path.join(props.root, 'assets/lit-logo.png')}"/>
            <link rel="icon" href="${path.join(props.root, 'assets/lit-logo.png')}"/>
            <link rel="stylesheet" href="${path.join(props.root, 'style.css')}"/>
            ${styles}
        </head>
        <body>
            ${app}
            <script src="//cdn.jsdelivr.net/npm/eruda"></script>
            <script>eruda.init();</script>
            <script async src="${path.join(props.root, 'web.bundle.js')}"/>
            
        </body>
    </html>`
}
