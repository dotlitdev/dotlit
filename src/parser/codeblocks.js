import visit from 'unist-util-visit'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('codeblocks')

const LSP = '__.litsp__'
const NONESCAPEDSPACES_REGEX = /([^\\])\s/g
const LANG = 'lang'
const ATTR = 'attribute'
const TAG = 'tag'
const DIREC = 'directive'
const FILENAME = 'filename'
const URI = 'uri'
const UNKNOWN = 'unknown'

const isListType = t => [TAG,DIREC,UNKNOWN].indexOf(t) >= 0

export default function (...args) {
    return (tree) => visit( tree, 'code', transform )
}

function transform (node, index, parent) {  
    console.log( '[CodeBlocks] Visiting: ', node.lang, node.meta)
    const litMeta = parseMeta(node)
    
    node.data = {
        ...node.data,
        meta: litMeta,
        hProperties: {
            className: litMeta && litMeta.tags ? litMeta.tags.map( t => `tag-${t}`).join(' ') : '',
            meta: litMeta,
        }
    }
    return node
}


export const parseMeta = function parseMeta (node) {
    const raw = `${node.lang || ''} ${node.meta || ''}`.trim()
    console.log(`[CodeBlocks] lang: "${node.lang}" meta: "${node.meta}", raw: "${raw}"`)

    const isOutput = raw.indexOf('>') === 0
    const hasOutput = node.meta && node.meta.indexOf('>') >= 0
    let hasSource = node.meta && node.meta.indexOf('<') >= 0

    let input = raw
    let _, output, source
    let fromSource;

    if (isOutput) {
        [_, input] = raw.split('>').map( x => x.trim() )
    }

      if (hasOutput) {
        [input, output] = input.split('>').map( x => x.trim() )
      }

      if (hasSource) {
        [input,source] = input.split('<').map( x => x.trim() )
      }

    const meta = input
        .replace(NONESCAPEDSPACES_REGEX, "$1" + LSP)
        .split(LSP)
        .map(ident)
        .reduce(reduceParts, {})
    
    meta.isOutput = isOutput
    meta.output = output && parseMeta({ meta: output })
    meta.hasOutput = !!output
    meta.hasSource = !!source
    meta.source = source && parseMeta({ lang: 'txt', meta: source })
    meta.raw = raw
    if (meta.source) meta.fromSource = meta.source.filename || meta.source.uri

    return meta
}

function isUri(str) {
  return str.startsWith('http') || str.startsWith('//')
}

function ident (x, i) {
    let type, value = x
    if (i === 0) {
      type = LANG
    }
    else if(x && x[0]) {
      if (x[0] === "#") {
        type = TAG
        value = x.slice(1)
      }
      else if (x[0] === "!") {
        type = DIREC
        value = x.slice(1)
      }
      else if (x.indexOf("=") > 0) {
        type = ATTR
        value = x.split("=")
        value = {
          type: value[0],
          value: value[1]
        }
      }
      else if(i===1) {

        if (isUri(x)) type = URI
        else type = FILENAME
      }
      else if (!type) type = UNKNOWN
    }
    return {type, value}
  }
  
  function reduceParts(memo,item, i) {
    memo.attrs = memo.attrs || {}

    if (item.type === ATTR){
        memo.attrs[item.value.type] = item.value.value
        item = item.value
    }

    if (isListType(item.type)) {
        const collective = `${item.type}s`
        if(memo[collective]) {
             memo[collective]
             .push(item.value)
        } else {
            memo[collective] = [item.value]
        }
        if (item.type === DIREC) {
            // memo.attrs[item.value] = true
        }
    } else {
        memo[item.type] = item.value
    }
    
    return memo
}
  

export const metaToString = (meta) => {

  const prefix = p => str => p + str
  const tag = prefix("#")
  const dir = prefix("!")
  const attr = ([key,value]) => `${key}=${value}`

  const parts = [];
  const dirs = meta.directives || []
  const tags = meta.tags || []
  const attrs = meta.attrs || {}

  parts.push(meta.isOutput && ">");
  parts.push(meta.lang);
  parts.push(meta.filename || meta.uri);
  
  dirs.forEach( d => parts.push(dir(d)))
  Object.entries(attrs).forEach( (e) => parts.push(attr(e)))
  tags.forEach( t => parts.push(tag(t)))

  if (meta.source) {
    parts.push("<")
    parts.push(metaToString(meta.source))
  }

  if (meta.output) {
    parts.push(">")
    parts.push(metaToString(meta.output))
  }

  return parts.filter((x) => x).join(" ");
};
