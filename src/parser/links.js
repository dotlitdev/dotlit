import path from 'path'
import visit from 'unist-util-visit'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('links')

export const resolveLinks = (options = { root: '', filepath: ''}) => (...args) => tree => {
    console.log('[Links] Init', options)
    return visit(tree, isLink, transform(options))
}

const isLink = (node) => ['link', 'wikiLink'].indexOf(node.type) >= 0

const transform = options => (node, index, parent) => {
    return decorateLinkNode(node, options.root, options.filepath)
}

export const wikiLinkOptions = files => ({
     pageResolver: (name) => [
       name.replace(/[^\w\s/-]+/g,'')
           .trim()
           .replace(/\s+/g, '_')
           .toLowerCase()
     ],
})
// ({ 
//     permalinks: files,
//     pageResolver: nameToPermalinks,
//     hrefTemplate: (permalink) => `${permalink}?file=${permalink}`
// })

export const decorateLinkNode = (link, root = '', filepath = '') => {
    // console.log(link)
    const wikilink = link.type === 'wikiLink'
    const url = wikilink
        ? link.data.permalink + '.lit'
        : link.url

    // console.log(`[Links] resolving (${link.type}) [${url}] '${root}', "${filepath}"`)
    const isAbsolute = /(https?\:)?\/\//.test(url)
    const isFragment = /^(\?|#).*/.test(url)
    const isRelative = url && !isAbsolute && !isFragment

    let canonical = url
    let href = url
    if (isRelative) {
        const abs = path.resolve(root, path.dirname(filepath), url)
        canonical = path.relative(path.resolve(root), abs)
        href = url.replace(/\.(md|lit)/i, '.html')
    }

    link.type = 'link'
    link.url = href
    link.title = link.title || link.value
    link.data = {
        isAbsolute,
        isFragment,
        isRelative,
        canonical,
        wikilink,
    }

    if (wikilink) {
        const [base,frag] = link.url.split("#")
        link.url = base + '?file=' + canonical + (frag ? `#${frag}` : '')
        link.children = [{type: 'text', value: link.value }]
        link.data.hProperties = {
            wikilink
        }
    }
    
    delete link.value

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
