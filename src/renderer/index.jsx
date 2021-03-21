import path from 'path'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import ReactDOMServer from 'react-dom/server'
import React from 'react'
import {log, level} from '../utils/console'

import {processor as parserProcessor} from '../parser'

import Document from '../components/Document'
import Paragraph from '../components/base/Paragraph'
import Link from '../components/base/Link'
import Codeblock from '../components/base/Codeblock'
import Cell from '../components/Cell'

export function processor() {
    return parserProcessor()
    .use(()=> ({}))
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

export function renderToVfile(vfile, cmd, links) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    level(2, log)('[Render] to vFile', vfile.path)

    const output = vfile;

    const notebook = <Document
        file={output}
        root={cmd.base || relroot}
        backlinks={links}
        processor={processor()}
    />

    output.contents = ReactDOMServer.renderToString(notebook)
    output.extname = '.html'
    return output
}
