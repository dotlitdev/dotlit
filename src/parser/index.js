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
    .use(wikiLinkPlugin, wikiLinkOptions(files))
    .use(slug)
    .use(toc, {})
    .use(headingIds)
    .use(footnotes, {inlineNotes: true})
}

export const processor = ({files, fs, litroot} = {files: []}) => {
    console.log('[Parser]', {files, fs,litroot})
    return baseProcessor({files, litroot})
    // remark-litmd (rehype compatable)

    .use(litcodeblocks)
    // Async reparse `md` codeblocks as children
    .use(function ({baseProcessor}) {
        return async (tree, file) => {
            file.data = file.data || {}
            file.data.__mdcodeblocks = 0
            const promises = [];
            visit(tree, 'code', (node,index,parent) => {
                if (!node.data || !node.data.meta || node.data.meta.lang !== 'md') return;

                const idx = file.data.__mdcodeblocks++
                // instead of await
                const p = new Promise(async resolve => {
                     console.log("[mdcode] - " + idx + "Node: ", node)
                     const p = baseProcessor()
                     const parsed = await p.parse( node.value )
                     const ast = await p.run(parsed)
                     console.log("[mdcode] - " + idx + " AST: ", ast)
                     node.children = ast.children
                     // node.type = 'mdcode'
                     // delete node.value
                     resolve()
                });
               
                promises.push(p)
            });
            await Promise.all(promises);
            return null
        }
    }, {baseProcessor})
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
