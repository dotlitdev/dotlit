import heading from "mdast-util-heading-range";
import visit from "unist-util-visit";
import flatMap from "unist-util-flatmap";
import { getConsoleForNamespace } from '../utils/console'
import { Identity } from "../utils/functions";

const console = getConsoleForNamespace('sections', {disabled: true})

const firstChild = (node,type) => node.children 
            && node.children[0]
            && node.children[0].type === type

const createCell = (node,nodes) => {
     const pos = node.position
     // pos.start.offset = pos.start.offset - pos.start.column
     // pos.start.column = 0
     return {
          type: "cell",
          position: pos,
          data: {
            hName: "cell",
            hProperties: {
              class: "cell",
            },
          },
          children: nodes || [node],
        }
}

const createSection = (node,nodes) => {
  if (!nodes) node.children = cellsFromNodes(node.children)
  return {
        type: "section",
        data: {
          hName: "section",
        },
        position: node.position,
        children: nodes || [node],
      }
}

const cellsFromNodes = (nodes, {addSectionDataToFirstCell}={}) => {

  const cells = [];
  let newCell = null;

  nodes.map((current, index) => {
    const node = current;
    console.log("[Sections] child: ", index, node.type);

    if (node.type === "section") {
      newCell = null;
      cells.push(node);

    } else if (false && node.type === "list" && node.spread) {
      newCell = null;
      let listSection = createSection(node)
      cells.push(listSection);

    } else if (false && node.type === "listItem" && node.spread) {
      newCell = null;
      let listItem = node
      if (firstChild(listItem, 'section')) {
        console.log("[Sections] ListItem with section: ", node.type);
        listItem.children = listItem.children.map( section => {
          section.children = cellsFromNodes(section.children)
        })
      } else {
        listItem.children = [createSection(node, node.children)]
      }
      
      cells.push(listItem);

    } else if (node.type === "code") {
      const next = nodes[index+1]
      const attached = node => node && node.data && node.data.meta && node.data.meta.attached
      const nextIsAttached = attached(next)
                            
      let singleCell = createCell(node)
      if (nextIsAttached) {
          newCell = singleCell
         
      } else if (newCell && attached(node)) {
          newCell.children.push(node)
          if (node.position) newCell.position.end = node.position.end;
          cells.push(newCell)
          newCell = null

      } else {
          newCell = null
          cells.push(singleCell);
      }
     
     
      
    } else if (newCell) {
      newCell.children.push(node);
      if (node.position) newCell.position.end = node.position.end;

    } else {
      newCell = createCell(node)
      if(addSectionDataToFirstCell) newCell.data.section = addSectionDataToFirstCell
      cells.push(newCell);
    }
  });
  return cells;

}

export const sections = (...args) => (tree) => {
  console.log('[Sections II] Init.', args, tree.type, tree.children.length)
  let headings = 0
  const newSection = (children) => {
    const first = children[0]
    const last = children[ children.length - 1]
    const depth = first.depth || 0
    first.processed = true
    return {
      type: 'section',
      data: {
        name: first.data.id,
        hName: 'section',
        hProperties: {
          depth: depth,
          id: first.data.id,
        }
      },
      depth: depth,
      children: children,
      position: {
        start: first.position.start,
        end: last.position.end
      }
    }
  }

  visit(tree, 'heading', (node, index, parent) => {
    if (node.processed) {
      console.log(`[Sections II] Ignoring already processed node ${node.data.id}`)
    } else if (parent.type === 'root') {
      console.log(`[Sections II] heading "${node.data.id}" ${headings}, depth: ${node.depth}`)
      // remove rehype ids 
      node.data.hProperties = {}
      const section = parent.children[index] = newSection([node])
      const children = parent.children
      
      for (let i = index + 1; i < children.length; i++) {
        if (!children[i] || children[i].processed) {
          console.log('Skipping removed', children[i])
          break
        }
        const nextNode = children[i]
        if ((nextNode.type === 'heading' || nextNode.type === 'section') && nextNode.depth <= node.depth) {
          console.log(`[Sections II] ended "${node.data.id}" due to "${nextNode.data.id || nextNode.data.name}"`, nextNode.type, nextNode.depth)
          console.log(`[Sections II] contains: "${node.data.id}"`, section.children.map( n => n.type).join(','))
          break;
        }
        console.log(`[Sections II] child index: ${i}, type: ${nextNode.type} depth: ${nextNode.depth} id: ${nextNode.data && (nextNode.data.id || nextNode.data.name)}`)
        section.children.push(nextNode)
        if (nextNode.position) section.position.end = nextNode.position.end
        delete parent.children[i]
      }
      headings++
      node = section 
      node.children = cellsFromNodes(node.children, {addSectionDataToFirstCell: { id: section.data.id, position: section.position}})
    } else {
      console.log('[Sections II] WARN: Header parent not root', node.data.id)
    }
  }, true)

  console.log("Headings: ", headings)
  if (!headings) {
    tree.children = cellsFromNodes(tree.children)
  } else {
    tree.children = tree.children.filter(Identity)
  }
  
}


const cells = (...args) => (tree) => {
  visit( tree, cells )
}


export const ungroupSections = (options = {}) => (...args) => (tree) => {
  console.log("[UnSection] Init", options)
  tree = flatMap(tree, (node) => {
    if (node.type === "cell") {
      return node.children
    } else if (node.type === "section") {
      return node.children
    } else {
      return [node]
    }
  })
  return tree
}
