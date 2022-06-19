// This files source is defined in [[testing/section_grouping|🔬 Testing Section grouping]]

export const sections = (options) => (...args) => (tree) => {
  const {processSection} = options
  const stack = [tree]
  const nodes = tree.children
  tree.children = []

  const createSection = (node) => {
    const section = {
      type: 'section',
      children: [node],
      depth: node.depth || 0,
      position: node.position,
    }
    stack.at(-1).children.push(section)
    stack.push(section)
  }

  const shouldPopStack = (n, force) => {
    const s = stack.at(-1)
    const notRoot = s.type !== 'root'
    const nShallow = s.depth >= n.depth
    return notRoot && (force || nShallow)
  }

  const endSection = () => {
    const s = stack.pop()
    if (processSection) processSection(s)
  }

  nodes.map((node, index) => {
    const section = stack.at(-1)
    if (section.type === 'root') {
      createSection(node)
    } else if (node.type === 'heading') {
      if (node.depth > section.depth) {
        createSection(node)
      } else {
        while (shouldPopStack(node)) {
          endSection()
        }
        createSection(node)
      }
    } else {
      section.children.push(node)
      section.position.end = node.position.end
    }

    if (!nodes[index+1]) {
      while (shouldPopStack(node, true)) {
          endSection()
        }
    }
  })

}