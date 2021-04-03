import filter from 'unist-util-filter'
import {selectAll as select} from 'unist-util-select'
import { getConsoleForNamespace } from './functions'

const console = getConsoleForNamespace('util')

export const atPos = pos => (node) => {
  const pos2 = node.position
  const startInside = (pos2.start.line >= pos.start.line
    && pos2.start.line <= pos.end.line)
  const endInside = (pos2.end.line >= pos.start.line
     && pos2.end.line <= pos.end.line)
  console.log("atPos: " + node.type, startInside || endInside ,pos2.start.line, pos2.end.line, startInside, endInside, pos.start.line, pos.end.line)
  return startInside || endInside
}

export const selectAll = (type, pos, tree) => {
  const filteredTree = filter(tree, atPos(pos))
  const nodes = select(type, filteredTree)
  return nodes
}
