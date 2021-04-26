import React, {useEffect} from 'react'
import { getConsoleForNamespace } from '../utils/console'
import {btoa} from '../utils/safe-encoders'

import {viewer as mdViewer} from './viewers/md'
import {viewer as graphViewer} from './viewers/graph'
const console = getConsoleForNamespace('Viewers')

const viewers = {
  csv: ({node}) => {
    const rows = node.value.split("\n").map( (row,i) => {
       const cols = row.split(",").map( (col,j) => <td key={j}>{col}</td>)
       return <tr key={i}>{cols}</tr>
    })
    return <table>{rows}</table>
  },
  html: ({node}) => <div dangerouslySetInnerHTML={{__html: node.value}}></div>,
  svg: ({node}) => <div dangerouslySetInnerHTML={{__html: node.value}}></div>,
  uri: ({node}) => <iframe src={node.value}></iframe>,
  iframe0: ({node}) => <iframe src={"data:text/html;base64," + btoa(node.value)}></iframe>,
  iframe: ({node}) => {
    if (node.meta
        && node.meta.lang === 'uri')
        return <iframe src={node.value} />
    else return <iframe srcDoc={node.value} style={{
      aspectRatio: (node.meta && node.meta.aspect) || '1.6',
    }}></iframe> 
  },
  graph: graphViewer,
  md: mdViewer,
}

const hasViewDirective = meta => {
  const has = d => meta.directives && meta.directives.indexOf(d) >= 0
  return has('inline') 
         || has('above') 
         || has('below')
}

export const getViewer = (meta, customViewers = {}) => {
  const view = meta && (meta.viewer || meta.lang)
  const CustomViewer = customViewers[view] && customViewers[view].viewer
  const useViewer = view && (meta.viewer || meta.isOutput 
       || hasViewDirective(meta))
  const viewer = CustomViewer || viewers[view]
  console.log(`[Viewer] view: ${view} custom: ${!!CustomViewer} use: ${!!useViewer}`)
  return view && useViewer && viewer
}
