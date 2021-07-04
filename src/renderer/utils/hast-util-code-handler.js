'use strict'

module.exports = code

var u = require('unist-builder')
var toHast = require('mdast-util-to-hast')

function code(h, node) {
  // console.log("[HastCodeHander] start", node)
  // transcludeCode sets data.value
  node.value = node.data?.value || node.value
  var originalSource = node.data?.originalSouce

  var value = node.value ? node.value + '\n' : ''
  // To do: next major, use `node.lang` w/o regex, the splitting’s been going
  // on for years in remark now.
  var lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/)
  var props = {}
  var code

  if (lang) {
    props.className = ['language-' + lang]
  }

  const divcode = u('blockquote', node.children)

  code = h(node, 'code', props, toHast(divcode).children)
  code.data = {
    value: value,
    meta: node.meta,
    originalSource: originalSource,
    __customHastCodeHandler: true,
  }
  // console.log("[HastCodeHander] end", code)
  return h(node.position, 'pre', [code])
}
