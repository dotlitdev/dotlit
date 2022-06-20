export const cells = (section) => {
  const stack = []
  const nodes = section.children
  section.children = stack

  const needNewCell = () => {
    const cell = stack[stack.length-1]
    return !cell || cell.type === 'section'
  }

  const createCell = (node) => {
    stack.push({
       type: 'cell',
       children: [node],
       position: node.position,
       data: {
         code: node.type === 'code',
         hName: "cell",
         hProperties: {
           class: "cell",
         },
       },
     })
  }

  const addToCell = (node) => {
    const cell = stack[stack.length-1]
    cell.children.push(node)
    if (node.position) cell.position.end = node.position.end
  }

  nodes.map((node, index) => {
    const prev = index ? stack[index-1] : null
    if (node.type === 'section')
      stack.push(node)
    else if (node.type === 'code') {
      if (prev?.data?.code && node.data?.meta?.attached) {
        addToCell(node)
      } else {
        createCell(node)
      }
    } else if (needNewCell()) {
      createCell(node)
    } else {
      addToCell(node)
    }
  })

  return section
}
