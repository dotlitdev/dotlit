export const viewer = ({node,React}) => {
  return React.createElement('pre', {style: {color: 'black'}}, lit.utils.inspect(node))
}