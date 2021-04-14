import unified from 'unified'
import select from 'unist-util-select'
import visit from 'unist-util-visit'

import markdown from 'remark-parse'
import tostring from 'remark-stringify'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import { wikiLinkPlugin } from 'remark-wiki-link'

import {sections, groupIntoSections, ungroupSections} from './sections'
import litcodeblocks from './codeblocks'
import frontmatter from './frontmatter'
import {resolveLinks, wikiLinkOptions} from './links'
import { getConsoleForNamespace} from '../utils/console'

const console = getConsoleForNamespace('parser')


// used for testing add to functions util if useful
const wait = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const baseProcessor = (options = {}) => {
    return unified()
    // remark
    .use(markdown, {})
    .use(gfm)
    .use(frontmatter, {})
    .use(wikiLinkPlugin, wikiLinkOptions(options.files))
    .use(slug)
    .use(toc, {})
    .use(headingIds)
    .use(footnotes, {inlineNotes: true})
}

export const processor = (options={files: []}) => {
    console.log('[Parser]', options)
    return baseProcessor(options)
    // remark-litmd (rehype compatable)

    // Async reparse `md` codeblocks as children
    .use(function (...args) {
        return async (tree, file) => {
            file.data = file.data || {}
            file.data.__mdcodeblocks = 0
            const promises = [];
            visit(tree, 'code', (node,index,parent) => {
                // instead of:
                // await wait(100)
                const p = wait(100).then( () => {
                     file.data.__mdcodeblocks++
                })
                promises.push(p)
            });
            await Promise.all(promises);
            return null
        }
    }, {})
    .use(resolveLinks())
    .use(sections, {})
    .use(litcodeblocks)
}   

export async function parse(vfile, options) {
    const p = processor(options)
    const parsed = await p.parse( vfile )
    const ast = await p.run(parsed)
    if (!parsed.data) parsed.data = {}
    parsed.data.ast = ast
    // parsed.data.frontmatter = select.selectAll('html',ast).reduce( (memo,el) => Object.assign(memo,el.data || {}),{})
    return parsed
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
