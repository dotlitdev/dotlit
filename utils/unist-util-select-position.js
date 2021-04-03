import filter from 'unist-util-filter'
import {selectAll as select} from 'unist-util-select'
import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('util')

// written from client
export const atPos = pos => (node) => {
  const pos2 = node.position
  const startInside = (pos2.start.line >= pos.start.line
    && pos2.start.line <= pos.end.line)
  const endInside = (pos2.end.line >= pos.start.line
    && pos2.end.line <= pos.end.line)
  const wraps = pos2.start.line <= pos.start.line 
    && pos2.end.line >= pos.end.line

  const any = wraps || startInside || endInside 
  console.log("atPos: " + node.type, any ,pos2.start.line, pos2.end.line, wraps, startInside, endInside, pos.start.line, pos.end.line)
  return any
}

export const selectAll = (type, pos, tree) => {
  const filteredTree = filter(tree, atPos(pos))
  const nodes = select(type, filteredTree)
  return nodes
}