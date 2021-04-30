import unified from 'unified'
import markdown from 'remark-parse'
import tostring from 'remark-stringify'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import { wikiLinkPlugin } from 'remark-wiki-link'
import select from 'unist-util-select'
import { toString } from 'mdast-util-to-string'

import {sections, groupIntoSections, ungroupSections} from './sections'
import litcodeblocks from './codeblocks'
import frontmatter from './frontmatter'
import {mdblocks} from './mdblocks'
import {resolveLinks, wikiLinkOptions} from './links'
import { getConsoleForNamespace} from '../utils/console'
//import { transform as jsTransform } from './transformers/js'

const jsTransform = null
const console = getConsoleForNamespace('parser')


// used for testing add to functions util if useful
const wait = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const baseProcessor = ({litroot, files} = {}) => {
    return unified()
    // remark
    .use(markdown, {})
    .use(gfm)
    .use(frontmatter, {})
    // Extact title
    .use((...args) => (tree,file) => {
        if(!file.data.frontmatter || !file.data.frontmatter.title) {
           console.log("no title in frontmatter, extracting")
           file.data = file.data || {}
           file.data.frontmatter = file.data.frontmatter || {}
           const heading = select.select('heading', tree)
           console.log("Found heading:", heading)
           if (heading) {
               const title = toString(heading)
               console.log("As text: ", title)
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
    console.log(litroot, {files: !!files, fs: !!fs})
    return baseProcessor({files, litroot})
    // remark-litmd (rehype compatable)

    .use(litcodeblocks)
    // Async reparse `md` codeblocks as children
    .use(mdblocks, {baseProcessor})
    .use(resolveLinks({litroot}))

    .use(sections, {})

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
        .use(tostring, {
            bullet: '-',
            // handlers: {
            //     cell: debugAstToMarkdown,
            //     section: debugAstToMarkdown
            // }
        })
        .process(vfile)
}
