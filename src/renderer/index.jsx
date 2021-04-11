import path from 'path'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import {selectAll} from 'unist-util-select'

import ReactDOMServer from 'react-dom/server'
import React from 'react'

import {processor as parserProcessor} from '../parser'
import {transcludeCode} from './transcludeCode'
import {extractViewers} from './extractViewers'

import Document from '../components/Document'
import Paragraph from '../components/base/Paragraph'
import Link from '../components/base/Link'
import {Codeblock} from '../components/base/Codeblock'
import Cell from '../components/Cell'
import { Section } from '../components/Section'

import { getConsoleForNamespace } from '../utils/console'


const console = getConsoleForNamespace('codeblocks')

export function processor(fs) {
    return parserProcessor()
   
    // hoist ast to data
    .use( (...args) => {
         return (tree,file) => {
             console.log("[Hoist AST data]")
             file.data.ast = tree
         }
     })

    // transclude codeblocks with source
    // when available 
    .use( transcludeCode, {fs} )

    // extract custom viewers
    .use( extractViewers )

    // extract files to data
    .use( (...args) => {
         return (tree,file) => {
             console.log("[Extact files]")
             file.data.files = selectAll("code", tree)
         }
     })

    // hoist mdast data to hast data
    // Dosabled as failed to process due to JSON stringify error
    .use( (...args) => {
         return (tree,file) => {

             console.log("[Hoist mdast data] disabled")
             for (const code of selectAll("code", tree)) {
                 if (false && code.data) {
                     code.data.hProperties = code.data.hProperties || {}
                     code.data.hProperties.data = code.data
                 }
             }
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
            section: Section
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
