import path from 'path'
import visit from 'unist-util-visit'
import flatMap from 'unist-util-flatmap'
import {log, level} from '../utils/console'


export const resolveLinks = (options = { root: '', filepath: ''}) => (...args) => tree => {
    level(1, log)('[Links] Init', options)
    return visit(tree, isLink, transform(options))
}

const isLink = (node) => ['link', 'wikiLink'].indexOf(node.type) >= 0

const transform = options => (node, index, parent) => {
    return decorateLinkNode(node, options.root, options.filepath)
}

export const decorateLinkNode = (link, root, filepath) => {
    link.data = link.data ? link.data : {}

    if (link.type === 'wikiLink') {
        if (link.data.exists === 'false') {
            link.data.hProperties.title = 'Click to create new file'
        } else {
            link.url = link.data.permalink
        }
        
    }

    level(2, log)(`[Links] resolving (${link.type})`, link.url, root, filepath)
    const isAbsolute = typeof root === 'undefined' || /(https?\:)?\/\//.test(link.url)
    const isFragment = /(\?|#).*/.test(link.url)
    const isRelative = typeof root !== 'undefined' && link.url && !(isAbsolute || isFragment)

    link.data = link.data ? link.data : {}


    if (isRelative) {
        const abs = path.resolve(root, path.dirname(filepath), link.url)
        const newPath = path.relative(path.resolve(root), abs)
        link.data.canonical = newPath
    } else {
        link.data.canonical = link.url
    }

    link.data.original = link.url
    link.url = link.url.replace(/\.(md|lit)/i, '.html')

    link.data.isAbsolute = isAbsolute
    link.data.isFragment = isFragment
    link.data.isRelative = isRelative

    link.data.hProperties = link.data.hProperties || {}
    link.data.hProperties.className += isAbsolute 
      ? ' absolute'
      : isRelative
        ? ' relative'
        : isFragment
          ? ' fragment'
          : ''

    return link
}

export const nameToPermalinks = (name) => {
    const full = name.replace(/ /g, '_').toLowerCase()
    const tail = path.basename(full)

    return ['.lit', 'md'].flatMap( ext => [full + ext, tail + ext])
    return [full+'.lit', full+'.md', tail+'.lit', tail+'.md']
}
export const nodeMappings = (files) => {
    const mappings = {}
    files.forEach( (filepath) => {

    })
    return mappings;
}
