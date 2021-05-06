import diff from 'https://cdn.skypack.dev/diff'

export const viewer = ({node,React}) => {
  return React.createElement('pre', {style: {color: 'black'}}, lit.utils.inspect(diff))
}