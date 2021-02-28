import unified from 'unified'
import markdown from 'remark-parse'
import tostring from 'remark-stringify'
import frontmatter from 'remark-frontmatter'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'
import { wikiLinkPlugin } from 'remark-wiki-link'

import {groupIntoSections, ungroupSections} from './sections'
import litcodeblocks from './codeblocks'

import {resolveLinks} from './links'

import {log} from '../utils/console'

// const { stringify } = require('querystring')

export const processor = (options={files: []}) => {
    return unified()

    // remark
    .use(markdown)
    .use(wikiLinkPlugin, { 
        permalinks: options.files,
        pageResolver: (name) => {

            const full = name.replace(/ /g, '_').toLowerCase()
            const tail = path.basename(full)
            return [
                full + '.lit', 
                full + '.md',
                tail + '.lit', 
                tail + '.md',
            ]
        },
        hrefTemplate: (permalink) => `${permalink}`
    })
    .use(slug)
    .use(headingIds)
    // .use(headings)
    // .use(toc, {})
    .use(frontmatter, {
        type: 'yaml', marker: {
            open: '<!--', close: '-->'
        }
    })
    .use(footnotes, {inlineNotes: true})
    
    // remark-litmd (rehype compatable)
    .use(resolveLinks())
    .use(groupIntoSections())
    .use(litcodeblocks)
}   

export async function parse(vfile, options) {
    const p = processor(options)
    const ast = await p.parse( vfile )
    vfile.data = {
        ast: await p.run(ast)
    }
    return vfile
}

export function stringify(vfile) {
    return processor()
        .use(ungroupSections())
        .use(tostring, {
            bullet: '-',
            // handlers: {
            //     cell: debugAstToMarkdown,
            //     section: debugAstToMarkdown
            // }
        })
        .process(vfile)
}
