import React, {useEffect} from 'react'
import { getConsoleForNamespace } from '../utils/console'
import {btoa} from '../utils/safe-encoders'

const console = getConsoleForNamespace('Viewers')

const viewers = {
  csv: ({value}) => {
    const rows = value.split("\n").map( (row,i) => {
       const cols = row.split(",").map( (col,j) => <td key={j}>{col}</td>)
       return <tr key={i}>{cols}</tr>
    })
    return <table>{rows}</table>
  },
  html: ({value}) => <div dangerouslySetInnerHTML={{__html: value}}></div>,
  svg: ({value}) => <div dangerouslySetInnerHTML={{__html: value}}></div>,
  uri: ({value}) => <iframe src={value}></iframe>,
  iframe0: (node) => <iframe src={"data:text/html;base64," + btoa(node.value)}></iframe>,
  iframe: (node) => {
    if (node.meta
        && node.meta.lang === 'uri')
        return <iframe src={node.value} />
    else return <iframe srcDoc={node.value} style={{
      aspectRatio: (node.meta && node.meta.aspect) || '1.6',
    }}></iframe> 
  },
}

export const getViewer = (meta, customViewers = {}) => {
  const view = meta && (meta.viewer || meta.lang)
  const CustomViewer = customViewers[view] && customViewers[view].viewer
  const useViewer = view && (meta.viewer || meta.isOutput 
       || (meta.directives && meta.directives.indexOf('inline') >= 0))
  const viewer = CustomViewer || viewers[view]
  console.log(`[Viewer] view: ${view} custom: ${!!CustomViewer} use: ${!!useViewer} viewer:`, viewer)
  return view && useViewer && viewer
}
