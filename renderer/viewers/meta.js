export const viewer = ({node,React, lit}) => {
  return React.createElement('pre', {style: {color: 'black'}}, lit?.utils?.inspect(node))
}