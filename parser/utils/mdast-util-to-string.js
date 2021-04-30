// extracted from mdast-util-to-string

export const to_string = (node, options) => {
  var {includeImageAlt = true} = options || {}
  return one(node, includeImageAlt)
}

function one(node, includeImageAlt) {
  return (
    (node &&
      typeof node === 'object' &&
      (node.value ||
        (includeImageAlt ? node.alt : '') ||
        ('children' in node && all(node.children, includeImageAlt)) ||
        (Array.isArray(node) && all(node, includeImageAlt)))) ||
    ''
  )
}

function all(values, includeImageAlt) {
  var result = []
  var index = -1

  while (++index < values.length) {
    result[index] = one(values[index], includeImageAlt)
  }

  return result.join('')
}
