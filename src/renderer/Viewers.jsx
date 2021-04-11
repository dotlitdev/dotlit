import React from 'react'

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
  iframe: (node) => <iframe src={"data:text/html;base64," + btoa(node.value)}></iframe>,
}

export const getViewer = (meta, customViewers = {}) => {
  const view = meta && (meta.viewer || meta.lang)
  const customViewer = customViewers[view] && customViewers[view].viewer
  const useViewer = view && (meta.isOutput 
       || (meta.directives && meta.directives.indexOf('inline') >= 0))
  const viewer = customViewer || viewers[view]
  console.log(`[Viewer] view: ${view} custom: ${!!customViewer} use: {useViewer} viewer:`, viewer)
  return view && useViewer && viewer
}
