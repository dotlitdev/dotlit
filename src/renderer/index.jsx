import path from 'path'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import {selectAll} from 'unist-util-select'

import ReactDOMServer from 'react-dom/server'
import React from 'react'

import {log, level} from '../utils/console'

import {processor as parserProcessor} from '../parser'

import Document from '../components/Document'
import Paragraph from '../components/base/Paragraph'
import Link from '../components/base/Link'
import Codeblock from '../components/base/Codeblock'
import Cell from '../components/Cell'

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
    .use( (...args) => {
         return async (tree,file) => {
             if(!fs) return;
             
             for (const block of selectAll("code", tree)) {
                 if (block.data && block.data.meta && block.data.meta.fromSource) {
                    const filePath = path.join(path.dirname(file.path), block.data.meta.fromSource)
                    block.value = await fs.readFile(filePath)
                 }
             }
         }
     })

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

export async function renderToVfile(vfile, cmd, links) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    level(2, log)('[Render] to vFile', vfile.path)

    const output = await processor().process(vfile)
    const notebook = <Document
        file={output}
        root={cmd.base || relroot}
        backlinks={links}
    />

    output.contents = '<!DOCTYPE html>' + ReactDOMServer.renderToString(notebook)
    output.extname = '.html'
    return output
}

export async function renderedVFileToDoc(vfile, cmd) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    level(2, log)('[Render] to document vFile', vfile.path)

    const notebook = <Document
        file={vfile}
        root={cmd.base || relroot}
        backlinks={vfile.data.backlinks}
    />

    vfile.contents = ReactDOMServer.renderToString(notebook)
    vfile.extname = '.html'
    return vfile
}
