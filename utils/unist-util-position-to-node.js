export const positionToNode = (pos,tree) => {
  // TODO: implement

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

  if (tree.children) {

  } if (tree.position.start.line >= start.line && tree.position.end.line <= end.line) {
    return tree
  }
}