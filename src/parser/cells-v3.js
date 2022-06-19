export const cells = (section) => {
  const stack = []
  const nodes = section.children
  const section.children = stack

  const needNewCell = () => {
    const cell = stack.at(-1)
    return !cell || cell.type === 'section'
  }

  const createCell = (node) => {
    const type = node.type === 'code' ? 'code' : 'cell';
    stack.push({
       type: type,
       children: [node],
     })
  }

  nodes.children.map((node, index) => {
    const prev = index ? stack.at(index-1) : null
    if (node.type === 'section')
      stack.push(node)
    else if (node.type === 'code') {
      if (prev?.type === 'code') {
        // ...
      } else {
        createCell(node)
      }
    } else if (needNewCell()) {
      createCell(node)
    } else {
      stack.at(-1).children.push(node)
    }
  })
}