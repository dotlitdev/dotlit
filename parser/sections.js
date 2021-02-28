import heading from 'mdast-util-heading-range'
import isGenerated from 'unist-util-generated'
import removePosition from 'unist-util-remove-position'
import visit from 'unist-util-visit'
import flatMap from 'unist-util-flatmap'

import {log, level} from '../utils/console'
import cells from './cells'

const wrapSection = options => (start, nodes, end) => {
  level(2, log)("[Sections] Wrapping:", start && start.data.id, nodes && nodes.length, end && end.type)

  // const children = nodes && nodes.length ? visit({type:'root', children: [...nodes]}, 'heading', transform(options)) || [] : []
  // log("[Section] children:", children)
  const cells = []
  let newCell = null

  nodes = [start,...nodes]
  nodes.map( current => {
    const node = current //removePosition(current)
    level(3, log)( "[Sections] child: ", node.type)

    if (node.type === 'section') {

    }

    if (node.type === 'code') {

    }

    if (node.type !== 'section' && node.type !== 'code') {
      if (newCell) newCell.children.push(node) 
      else {
        newCell = {
          type: 'cell',
          data: {
            id: `${start.data.id}-${cells.length}`,
            hName: 'div',
            hProperties: {
              class: 'cell'
            }
          },
          children: [node]
        }
        cells.push(newCell)
      }
    } else {
      if (newCell) { 
        newCell = null
      }
      cells.push(node)
    }
  })

  return [{
    type: 'section',
    data: {
      id: start.data.id,
      hName: 'section', 
      hProperties: {
        href: start.data.id
      }
    },
    position: {
      start: start.position.start,
      end: end ? end.position.end : nodes[nodes.length - 1].position.end
    },
    children: [
      // Mark that heading as having been mutated, 
      // otherwise we'd be processing the same header 
      // over and over (infinite loop)
      ...cells
    ]
  }]
}


const transform = options => (node, index, parent) => {
  level(2, log)( '[Sections] Visiting', node.data.id)
  return heading(parent, (_, node2) => node.data.id === node2.data.id, wrapSection(options))
};

export const groupIntoSections = (options = {}) => (...args) => tree => {
  level(1, log)( '[Sections] Init')
  visit(tree, 'heading', transform(options), true)
};

export const ungroupSections = (options = {}) => (...args) => tree => {
  level(1, log)( '[UnSection] Init', options)
  tree = flatMap(tree, (node) => {
    if (node.type === 'cell') {
      return node.children
    } else if (node.type === 'section') {
      return node.children
    } else {
      return [node]
    }
  })
  // return tree
}