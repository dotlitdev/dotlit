import path from 'path'
import remark2rehype from 'remark-rehype'
import rehype2react from 'rehype-react'
import ReactDOMServer from 'react-dom/server'
import React from 'react'

import {processor as parserProcessor} from '../parser'

import Document from '../components/Document'
import Paragraph from '../components/base/Paragraph'
import Link from '../components/base/Link'
import Codeblock from '../components/base/Codeblock'


export function processor(relroot, filepath) {
    return parserProcessor()
    .use(()=> ({}))
    .use(remark2rehype)
    .use(rehype2react, {
        Fragment: React.Fragment,
        createElement: React.createElement,
        passNode: true,
        components: {
            p: Paragraph,
            a: Link,
            pre: Codeblock,
        }
    })
}

export function renderToVfile(vfile, cmd, links) {

    const root = path.resolve( cmd.output )
    const dir = path.dirname( path.join(root, vfile.path) )
    const relroot = path.relative(dir, root) || '.'

    console.log(root, relroot, dir, vfile.path, links)

    const output = vfile;

    const notebook = <Document
        title={vfile.stem}
        src={vfile.contents.toString()}
        root={relroot}
        path={vfile.path}
        backlinks={links}
        processor={processor(relroot, vfile.path)}
    />

    output.contents = ReactDOMServer.renderToString(notebook)
    output.extname = '.html'
    return output
}
