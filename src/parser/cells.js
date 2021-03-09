import visit from 'unist-util-visit'
import select from 'unist-util-select'
import {log} from '../utils/console'

export function reduceIntoCells(nodes) {
    const tree = []
    let current = null
    nodes.forEach(node => {
        if (node.type === 'section' || node.type === 'code') {
            tree.push(node)
            current = null
        } else {
            if (!current) current = {type: 'cell', children: [], data: { hName: 'cell'}}
            current.children.push(node)
        }      
    })
    return tree
}
  