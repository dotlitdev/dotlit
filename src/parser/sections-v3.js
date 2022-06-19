// This files source is defined in [[testing/section_grouping|🔬 Testing Section grouping]]

export const sections = (options) => (...args) => (tree) => {
  try {
  const {processSection} = options;
  const stack = [tree];
  const nodes = tree.children;
  tree.children = [];

  const createSection = (node) => {
    if (!node.position) throw new Error(`Node ${node.type} has no position`)
    const section = {
      type: 'section',
      children: [node],
      depth: node.depth || 0,
      position: node.position,
      data: {
        name: node.data.id,
        hName: 'section',
        hProperties: {
          depth: depth,
          id: node.data.id,
        }
      },
    };
    stack[stack.length-1].children.push(section);
    stack.push(section);
  }

  const shouldPopStack = (n, force) => {
    const s = stack[stack.length-1];
    const notRoot = s.type !== 'root';
    const nShallow = s.depth >= n.depth;
    return notRoot && (force || nShallow);
  }

  const endSection = () => {
    const s = stack.pop();
    if (processSection) {
      try {
        processSection(s);
      } catch(err) {
        throw new Error(`Failed to processSection due to ${err.message}`);
      }
    }
  }

  nodes.map((node, index) => {
    const section = stack[stack.length-1];
    if (section.type === 'root') {
      createSection(node);
    } else if (node.type === 'heading') {
      if (node.depth > section.depth) {
        createSection(node);
      } else {
        while (shouldPopStack(node)) {
          endSection();
        }
        createSection(node);
      }
    } else {
      // some list nodes have no position (toc?)
      if (!section.position) { throw new Error(`Section ${section.type} has no position`)}
      section.children.push(node);
      if (node.position) section.position.end = node.position.end;
    }

    if (!nodes[index+1]) {
      while (shouldPopStack(node, true)) {
          endSection();
        }
    }
  });

  } catch(err) {
    throw new Error(`Failed to group sections due to ${err.message}`);
  }

}