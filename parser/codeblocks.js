import visit from 'unist-util-visit'
import before from 'unist-util-find-before'
import after from 'unist-util-find-after'

import {log, level} from '../utils/console'
import { notEqual } from 'assert'

const LSP = '__.litsp__'
const NONESCAPEDSPACES_REGEX = /([^\\])\s/g
const LANG = 'lang'
const ATTR = 'attribute'
const TAG = 'tag'
const DIREC = 'directive'
const FILENAME = 'filename'

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
            className: litMeta && litMeta.tags ? litMeta.tags.map( t => `tag-${t}`).join(' ') : '',
            meta: litMeta,
        }
    }
    return node
}


function parseMeta (node) {
    const raw = `${node.lang || ''} ${node.meta || ''}`.trim()
    console.log(`lang: "${node.lang}" meta: "${node.meta}", raw: "${raw}"`)

    const isOutput = raw.indexOf('>') === 0
    const hasOutput = node.meta && node.meta.indexOf('>') >= 0
    const hasSource = node.meta && node.meta.indexOf('<') >= 0

    let input = raw
    if (isOutput) {
        input = raw.split('>')[1].trim()
    } else if (hasOutput) {
        input = raw.split('>')[0].trim()
    } else if (hasSource) {
        input = raw.split('<')[0].trim()
    }

    const meta = input
        .replace(NONESCAPEDSPACES_REGEX, "$1" + LSP)
        .split(LSP)
        .map(ident)
        .reduce(reduceParts, {})
    
    meta.isOutput = isOutput
    meta.hasOutput = hasOutput
    meta.hasSource = hasSource

    console.log(input, meta)
    return meta
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
      else if(i===1) type = FILENAME
      else if (!type) type = undefined
    }
    return {type, value}
  }
  
  function reduceParts(memo,item, i) {
    if (item.type === ATTR){
        item = item.value
    }
    const collective = `${item.type}s`
    console.log(i, memo, item)
    if(memo[collective]) {
        memo[collective]
        .push(item.value)
    }
    else if(typeof memo[item.type] != 'undefined') {
        memo[collective] = [memo[item.type], item.value]
        delete memo[item.type]
    } else {
        memo[item.type] = item.value
    }
    
    return memo
}
  

