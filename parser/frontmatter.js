import visit from 'unist-util-visit'
import before from 'unist-util-find-before'
import after from 'unist-util-find-after'
import yaml from 'js-yaml'

import {log, level} from '../utils/console'
import { notEqual } from 'assert'
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('frontmatter')

const FRONTMATTER_OPEN = '<!-- data'
const FRONTMATTER_CLOSE = '-->'

export default function (...args) {
    return (tree,file) => {
        const matters = []
        visit( tree, 'html', (node, index, parent) => {  
            if (node.value.indexOf(FRONTMATTER_OPEN) === 0 && node.value.indexOf(FRONTMATTER_CLOSE) === (node.value.length - FRONTMATTER_CLOSE.length)) {
                console.log( 'Raw', node.value)
                const yamlString = node.value.slice(FRONTMATTER_OPEN.length, node.value.length - FRONTMATTER_CLOSE.length).trim()
                try {
                    node.data = yaml.load(yamlString, 'utf8')
                } catch(err) {
                    node.data = {error: err.toString()}
                }
               console.log( 'Parsed', yamlString)
               matters.push(node.data)
            }
        })
        file.data.frontmatter = matters.reduce( (memo,matter) => Object.assign({}, memo, matter || {}), {})
    }
}

