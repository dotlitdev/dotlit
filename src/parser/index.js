import unified from 'unified'
import markdown from 'remark-parse'
import tostring from 'remark-stringify'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'

import gfm from 'remark-gfm'

import { wikiLinkPlugin } from 'remark-wiki-link'

import {groupIntoSections, ungroupSections} from './sections'
import litcodeblocks from './codeblocks'
import frontmatter from './frontmatter'

import {resolveLinks, wikiLinkOptions, nodeMappings, nameToPermalinks} from './links'

import {log} from '../utils/console'

// const { stringify } = require('querystring')

export const processor = (options={files: []}) => {
    return unified()

    // remark
    .use(markdown, {})
    .use(gfm)
    .use(frontmatter, {})
    .use(wikiLinkPlugin, wikiLinkOptions)
    .use(slug)
    .use(toc, {})
    .use(headingIds)
    // .use(headings)
   
    .use(footnotes, {inlineNotes: true})
    
    // remark-litmd (rehype compatable)
    .use(resolveLinks())
    .use(groupIntoSections())
    .use(litcodeblocks)
}   

export async function parse(vfile, options) {
    const p = processor(options)
    const parsed = await p.parse( vfile )
    const ast = await p.run(parsed)
    vfile.data.ast = ast
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
