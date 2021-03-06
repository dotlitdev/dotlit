import visit from 'unist-util-visit'
import before from 'unist-util-find-before'
import after from 'unist-util-find-after'

import {log, level} from '../utils/console'

export default function (...args) {
    return codeblocks
}

function codeblocks(tree) {
    return visit( tree, 'code', transform )
}

function transform (node, index, parent) {  
    level(2, log)( '[CodeBlocks] Visiting: ', node.lang, node.meta)
    const litMeta = parseMeta(node)
    node.data = {
        ...node.data,
        hProperties: {
            className: litMeta ? litMeta.tags.map( t => `tag-${t}`).join(' ') : '',
            meta: litMeta,
        }
    }
    return node
}


function parseMeta (node) {

    const meta = `${node.lang || ''} ${node.meta || ''}`
    const isOutput = meta && meta[0] === '>'

    // example meta in (): ```lang (name.ext#tag attr=value)
    const [input, output] = !isOutput ? meta.split('>') : [meta.split('>')[1]]

    const langMatch = input && input.match(/^(\S)+/)
    const [lang] = langMatch ? langMatch : ''

    const filenameMatch = input && input.match(/^\S+\s?([^\s#]+)/)
    const [filename] = filenameMatch ? filenameMatch : ''

    const tagsMatch = input && input.match(/#\S+/g)
    const tags = tagsMatch ? tagsMatch.map( t => t.slice(1)) : []

    const attrsMatch = input && input.match(/[a-zA-Z-0-9-_]+="?[^"\s]*"?/g)
    const attrs = !attrsMatch ? {} : attrsMatch.reduce( (memo, attr) => ({
        ...memo, 
        [attr.split('=')[0]]: [attr.split('=')[1]]
    }), {})


    if (output) {
        const [full, outputLang, outputMeta] = output.trim().match(/^(\S+)\s?(.*)?/)
        const parsedOutput = parseMeta({meta: outputMeta})
        return {
            lang,
            filename, tags, attrs,
            output: { lang: outputLang, ...parsedOutput}
        }
    } else {
        return { 
            lang, filename, tags, attrs, isOutput }
    }
    
    
    
}

