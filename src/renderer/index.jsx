import path from 'path'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import {selectAll} from 'unist-util-select'

import ReactDOMServer from 'react-dom/server'
import React from 'react'

import {processor as parserProcessor} from '../parser'
import {transcludeCode} from './transcludeCode'

import Document from '../components/Document'
import Paragraph from '../components/base/Paragraph'
import Link from '../components/base/Link'
import Codeblock from '../components/base/Codeblock'
import Cell from '../components/Cell'

import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('codeblocks')

export function processor(fs) {
    return parserProcessor()
   
    // hoist ast to data
    .use( (...args) => {
         return (tree,file) => {
             file.data.ast = tree
         }
     })

    // transclude codeblocks with source
    // when available 
    .use( transcludeCode, {fs})

    // extract files to data
    .use( (...args) => {
         return (tree,file) => {
             file.data.files = selectAll("code", tree)
         }
     })
    .use(remark2rehype, {allowDangerousHtml: true})
    .use(rehype2react, {
        Fragment: React.Fragment,
        allowDangerousHtml: true,
        createElement: React.createElement,
        passNode: true,
        components: {
            p: Paragraph,
            a: Link,
            pre: Codeblock,
            cell: Cell,
        }
    })
}

export async function renderedVFileToDoc(vfile, cmd) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    console.log('[Render] to document vFile', vfile.path)

    const notebook = <Document
        file={vfile}
        root={cmd.base || relroot}
        backlinks={vfile.data.backlinks}
    />

    vfile.contents = ReactDOMServer.renderToString(notebook)
    vfile.extname = '.html'
    return vfile
}