export const positionToNode = (pos,tree) => {

  const start = pos.start
    ? pos.start
    : pos.line && pos.column
      ? pos
      : undefined

  const end = pos.end
    ? pos.end
    : pos.line && pos.column
      ? pos
      : undefined

  if (tree.position.start.line >= end.line) {
    return undefined
  }

  if (tree.children) {

  }
}