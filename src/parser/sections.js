import heading from 'mdast-util-heading-range'
import isGenerated from 'unist-util-generated'
import removePosition from 'unist-util-remove-position'
import visit from 'unist-util-visit'
import flatMap from 'unist-util-flatmap'

import {log, level} from '../utils/console'


const symbolFromPos = pos => {
  return `cell-${pos.line}:${pos.column}:${pos.offset}`
}

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
       newCell = null
       cells.push(node)
    }


    else if (node.type === 'list') {
       let listSection = {
    type: 'section',
    data: {
      // id: start.data.id,
      hName: 'section', 
      hProperties: {
        // href: start.data.id
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
      ...node.children
    ]
  }

     cells.push(listSection)

    }

    else if (node.type === 'code') {
       newCell = null
       let singleCell = {
          type: 'cell',
          position: node.position,
          data: {
            hName: 'cell',
            hProperties: {
              class: 'cell',
              "data-symbol": symbolFromPos(node.position.start)
            }
          },
          children: [node]
        }
        cells.push(singleCell)
    }

    else {
      if (newCell) {
        newCell.children.push(node)
        newCell.position.end = node.position.end
      } else {
        newCell = {
          type: 'cell',
          position: node.position,
          data: {
            hName: 'cell',
            hProperties: {
              class: 'cell',
              "data-symbol": symbolFromPos(node.position.start)
            }
          },
          children: [node]
        }
        cells.push(newCell)
      }
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
