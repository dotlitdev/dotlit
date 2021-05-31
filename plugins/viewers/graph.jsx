export const viewer = ({node, React, fullscreen}) => {
   const c = React.createElement
   const data = node.value
   const dirs = node 
                && node.properties 
                && node.properties.meta 
                && node.properties.meta.directives 
                && node.properties.meta.directives.join(' ')
   const el = c('iframe', { className: dirs, srcDoc: `<!DOCTYPE html>
<head>
  <!-- ${fullscreen} -->
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
  }
