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

  graph: (node, {React}) => {
   const c = React.createElement
   const data = node.value
   const el = c('iframe', {srcDoc: `<head>
  <style> body { margin: 0; } </style>
  <script src="https://unpkg.com/force-graph"></script>
  <!-- from: https://github.com/vasturiano/force-graph -->
</head>
<body>
  <div id="graph"></div>
  <script>
    const data = ${data};
      const thisfile = window.parent.lit.location.src
      const elem = document.getElementById('graph')
      const Graph = ForceGraph()(elem)
        .graphData(data)
        .nodeId('id')
        .nodeVal((n) => n.backlinks ? n.backlinks.length : 1)
        .nodeLabel('id')
        .nodeAutoColorBy('type')
        // .linkColor(d => data.nodes[d.source].exists ? 'red' : 'lightblue')
        .linkDirectionalArrowLength(6)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
          // Center/zoom on node
          Graph.centerAt(node.x, node.y, 1000);
          Graph.zoom(2, 2000);
        });

        setTimeout( () => {
            const { nodes, links } = Graph.graphData()
            const node = nodes.filter( n => n.id === thisfile)[0]
            Graph.centerAt(node.x, node.y, 1000);
            Graph.zoom(2, 1000);
        }, 2000)

  </script>
</body>`})
   return el
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
