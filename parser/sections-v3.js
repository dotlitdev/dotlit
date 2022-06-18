// This files source is defined in [[testing/section_grouping|🔬 Testing Section grouping]]

export const sections = ({processSection}) => (tree) => {
  const stack = [tree]
  const nodes = tree.children
  tree.children = []

  const createSection = (node) => {
    const section = {
      type: 'section',
      children: [node],
      depth: node.depth || 0,
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

  for (const node in nodes) {
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
    }

    if (!nodes[index+1]) {
      while (shouldPopStack(node, true)) {
          endSection()
        }
    }
  }

}