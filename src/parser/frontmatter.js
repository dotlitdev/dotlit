import visit from 'unist-util-visit'
import before from 'unist-util-find-before'
import after from 'unist-util-find-after'
import yaml from 'js-yaml'

import {log, level} from '../utils/console'
import { notEqual } from 'assert'

const FRONTMATTER_OPEN = '<!--'
const FRONTMATTER_CLOSE = '-->'

const transform = (options) => (node, index, parent) => {  
    level(0, log)( '[FrontMatter] now has access to file: ', !!options.file)
    if (node.value.indexOf(FRONTMATTER_OPEN) === 0 && node.value.indexOf(FRONTMATTER_CLOSE) === (node.value.length - FRONTMATTER_CLOSE.length)) {
        const yamlString = node.value.slice(FRONTMATTER_OPEN.length, node.value.length - FRONTMATTER_CLOSE.length).trim()
        console.log("ORIGINAL: ", node.value)
        console.log("YAML: ", yamlString)
        const newNode = {
            type: 'frontmatter',
            data: yaml.load(yamlString, 'utf8'),
            value: yamlString,
            position: node.position
        }
        console.log(newNode)
        node = newNode
    }
}

export default function (...args) {
    return (tree,file) => {
        visit( tree, 'html', transform({file}))
    }
}

