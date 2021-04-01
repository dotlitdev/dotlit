import heading from "mdast-util-heading-range";
import isGenerated from "unist-util-generated";
import removePosition from "unist-util-remove-position";
import visit from "unist-util-visit";
import flatMap from "unist-util-flatmap";

import { log, level } from "../utils/console";

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

const cellsFromNodes = nodes => {

  const cells = [];
  let newCell = null;

  nodes.map((current) => {
    const node = current;
    level(3, log)("[Sections] child: ", node.type);

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
        level(2, log)("[Sections] ListItem with section: ", node.type);
        listItem.children = listItem.children.map( section => {
          section.children = cellsFromNodes(section.children)
        })
      } else {
        listItem.children = [createSection(node, node.children)]
      }
      
      cells.push(listItem);

    } else if (node.type === "code") {
      newCell = null;
      let singleCell = createCell(node)
      cells.push(singleCell);
      
    } else if (newCell) {
      newCell.children.push(node);
      if (node.position) newCell.position.end = node.position.end;

    } else {
      newCell = createCell(node)
      cells.push(newCell);
    }
  });
  return cells;

}

const wrapSection = (options) => (start, nodes, end) => {
  level(2, log)(
    "[Sections] Wrapping:",
    start && start.data.id,
    nodes && nodes.length,
    end && end.type
  );

  nodes = [start, ...nodes]

  // log("[Section] nodes:", nodes)

  const cells = cellsFromNodes(nodes)

  return [
    {
      type: "section",
      data: {
        id: start.data.id,
        hName: "section",
        hProperties: {
          name: start.data.id,
        },
      },
      position: {
        start: start.position.start,
        end: end ? end.position.end : nodes[nodes.length - 1].position.end,
      },
      children: [
        // Mark that heading as having been mutated,
        // otherwise we'd be processing the same header
        // over and over (infinite loop)
        ...cells,
      ],
    },
  ];
};

const transform = (options) => (node, index, parent) => {
  level(2, log)("[Sections] Visiting", node.data.id);
  return heading(
    parent,
    (_, node2) => node.data.id === node2.data.id,
    wrapSection(options)
  );
};

export const groupIntoSections = (options = {}) => (...args) => (tree) => {
  level(1, log)("[Sections] Init");
  visit(tree, "heading", transform(options), true);
};

export const ungroupSections = (options = {}) => (...args) => (tree) => {
  level(1, log)("[UnSection] Init", options);
  tree = flatMap(tree, (node) => {
    if (node.type === "cell") {
      return node.children;
    } else if (node.type === "section") {
      return node.children;
    } else {
      return [node];
    }
  });
  // return tree
};
