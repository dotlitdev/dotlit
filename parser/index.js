import unified from 'unified'
import markdown from 'remark-parse'
import remarkStringify from 'remark-stringify'
import slug from 'remark-slug'
import headingIds from 'remark-heading-id'
import toc from 'remark-toc'
import footnotes from 'remark-footnotes'
import gfm from 'remark-gfm'
import wikiLinkPlugin from 'remark-wiki-link'
import select from 'unist-util-select'
import { to_string } from './utils/mdast-util-to-string'
import toMarkdown from 'mdast-util-to-markdown'

import {sections, ungroupSections} from './sections'
import {sections as sectionsV3} from './sections-v3'
import {cells as cellsV3} from './cells-v3'


import codeblocks, {parseMeta, metaToString} from './codeblocks'
import frontmatter from './frontmatter'
import {mdblocks} from './mdblocks'
import links, { decorateLinkNode } from './links'
import { getConsoleForNamespace} from '../utils/console'

import {time} from '../utils/timings'

//import { transform as jsTransform } from './transformers/js'

const jsTransform = null
const console = getConsoleForNamespace('parser')

const timer = () => ({ns, marker}) => (t,f) => { time(ns,marker) }

const baseProcessor = ({litroot, files} = {}) => {
    return unified()
    .use(timer(),{ns:'parser'})
    .use((...args) => (tree, file) => {
        console.log("Parsing file: ", file.path)
        file.data = file.data || {}
        if (file && file.path) {
            file.data.canonical = decorateLinkNode({url: file.path}, '', '/', files).data.canonical
        }
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

    .use(wikiLinkPlugin, links.wikiLinkOptions(files))
    .use(slug)
    .use(headingIds)
    .use(footnotes, {inlineNotes: true})

    .use(timer(),{ns:'parser', marker: 'baseProcessorComplete'})
}

export const processor = ({files, fs, litroot} = {files: []}) => {
    console.log(`Setting up processor litroot: "${litroot}" files: ${!!files} fs: ${!!fs}`)
    return baseProcessor({files, litroot})
    // remark-litmd (rehype compatable)

    .use(codeblocks)
    // Async reparse `md` codeblocks as children
    .use(mdblocks, {baseProcessor, litroot, files})
    .use(links.resolveLinks({litroot, files}))
    .use(toc, {})
    .use(sectionsV3({processSection: cellsV3}), {})
    .use(timer(),{ns:'parser', marker: 'processorComplete'})
}

export const utils = {
  mdblocks,
  sections, ungroupSections,
  links,
  codeblocks, parseMeta, metaToString,
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
        })
        .process(vfile)
}
