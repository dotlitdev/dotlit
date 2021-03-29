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

export const wikiLinkOptions = files => ({ 
    permalinks: files,
    pageResolver: nameToPermalinks,
    hrefTemplate: (permalink) => `${permalink}?file=${permalink}`
})

export const decorateLinkNode = (link, root, filepath) => {
    
    link.data = link.data || {}
    link.data.hProperties = link.data.hProperties || {}

    if (link.type === 'wikiLink') {
        link.data.hProperties.wikilink = true
        if (link.data.exists === 'false') {
            link.data.hProperties.title = 'Click to create new file'
        }
        link.url = link.data.hProperties.href
        
        
    }

    level(2, log)(`[Links] resolving (${link.type})`, link.url, root, filepath)
    const isAbsolute = typeof root === 'undefined' || /(https?\:)?\/\//.test(link.url)
    const isFragment = /(\?|#).*/.test(link.url)
    const isRelative = typeof root !== 'undefined' && link.url && !isAbsolute
    
    if (isRelative) {
        const abs = path.resolve(root, path.dirname(filepath), link.url)
        const newPath = path.relative(path.resolve(root), abs)
        link.data.canonical = newPath
    } else {
        link.data.canonical = link.url
    }

    link.data.canonical = link.data.canonical.split("?")[0]
    link.data.original = link.url
    link.url = link.url.replace(/\.(md|lit)/i, '.html')


    link.data.isAbsolute = isAbsolute
    link.data.isFragment = isFragment
    link.data.isRelative = isRelative

    
    link.data.hProperties.href = link.url
    // don't throw away wiki link classes (yet)
    link.data.hProperties.className = link.data.hProperties.className || ''
    
    link.data.hProperties.className += isAbsolute ? ' absolute' : ''
    link.data.hProperties.className += isRelative ? ' relative' : ''
    link.data.hProperties.className += isFragment ? ' fragment' : ''

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
