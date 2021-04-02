export const positionToNode = (pos,tree) => {
  // TODO: implement
  const start = pos.start
    ? pos.start
    : pos.line && pos.column
      ? pos
      : undefined
  
  
}