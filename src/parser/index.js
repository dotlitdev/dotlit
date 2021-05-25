import unified from 'unified'
import markdown from 'remark-parse'
import remarkStringify from 'remark-stringify'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import { wikiLinkPlugin } from 'remark-wiki-link'
import select from 'unist-util-select'
import { to_string } from './utils/mdast-util-to-string'
import toMarkdown from 'mdast-util-to-markdown'

import {sections, groupIntoSections, ungroupSections} from './sections'
import codeblocks from './codeblocks'
import frontmatter from './frontmatter'
import {mdblocks} from './mdblocks'
import linkUtils, {resolveLinks, wikiLinkOptions, decorateLinkNode, linkToUrl} from './links'
import { getConsoleForNamespace} from '../utils/console'
//import { transform as jsTransform } from './transformers/js'

const jsTransform = null
const console = getConsoleForNamespace('parser')

const baseProcessor = ({litroot, files} = {}) => {
    return unified()

    .use((...args) => (tree, file) => {
        console.log("Parsing file", file.path)
    })

    // remark
    .use(markdown, {})
    .use(gfm)
    .use(frontmatter, {})

    // Extact title
    .use((...args) => (tree,file) => {
        if(!file.data.frontmatter || !file.data.frontmatter.title) {
           
           file.data = file.data || {}
           file.data.frontmatter = file.data.frontmatter || {}
           const heading = select.select('heading', tree)
           // console.log("Found heading:", heading)
           if (heading) {
               console.log("No title in frontmatter, extracting heading.")
               const title = to_string(heading)
               file.data.frontmatter.title = title
           }
        }
    },{})

    .use(wikiLinkPlugin, wikiLinkOptions(files))
    .use(slug)
    .use(toc, {})
    .use(headingIds)
    .use(footnotes, {inlineNotes: true})
}

export const processor = ({files, fs, litroot} = {files: []}) => {
    console.log(`Setting up processor litroot: "${litroot}" files: ${!!files} fs: ${!!fs}`)
    return baseProcessor({files, litroot})
    // remark-litmd (rehype compatable)

    .use(codeblocks)
    // Async reparse `md` codeblocks as children
    .use(mdblocks, {baseProcessor})
    .use(resolveLinks({litroot}))

    .use(sections, {})

}

export const utils = {
  mdblocks,
  sections, ungroupSections,
  linkUtils, resolveLinks, wikiLinkOptions, decorateLinkNode, linkToUrl,
  codeblocks,
  remarkStringify,
  to_string,
  toMarkdown,
  frontmatter,
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

export const transformers = {
    jsx: jsTransform,
}


export function stringify(vfile) {
    return processor()
        .use(ungroupSections())
        .use(remarkStringify, {
            bullet: '-',
            // handlers: {
            //     cell: debugAstToMarkdown,
            //     section: debugAstToMarkdown
            // }
        })
        .process(vfile)
}
