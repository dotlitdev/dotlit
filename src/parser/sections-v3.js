// This files source is defined in [[testing/section_grouping|🔬 Testing Section grouping]]

export const sections = (...args) => (tree) => {
  const stack = [tree]
  const nodes = tree.children
  tree.children = []

  const createSection = (node) => {
    const section = {
      type: 'section',
      children: [node],
      depth: node.depth || 0,
    }
    // TODO? push section to stack[-1].children
    stack.push(section)
  }

  for (const node in nodes) {
    const section = stack[-1]
    if (section.type === 'root') {
      createSection(node)
    } else if (node.type === 'heading') {
      if (node.depth > section.depth) {
        createSection(node)
      } else {
        // TODO? stop before popping root?
        while (stack[-1].depth > node.depth ) {
          stack.pop()
        }
        createSection(node)
      }
    } else {
      section.children.push(node)
    }
  }

}