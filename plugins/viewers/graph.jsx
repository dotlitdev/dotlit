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
  <div id="info">
    <button id="fit">Fit All</button> <button id="zoom">Zoom</button> <button id="reheat">Reheat</button>
    <div id="node-info">
      path: <span id="path"></span> title: <span id="title"></span> link: <a id="link">Open</a>
    </div> 
  </div>
  <div id="graph"></div>
  <script>
    const data = ${data};
    const thisfile = window.parent.lit.location.src
    const elem = document.getElementById('graph')
    const info = document.getElementById('info')
    const nodeinfo = document.getElementById('node-info')
    const path = document.getElementById('path')
    const title = document.getElementById('title')
    const link = document.getElementById('link')

    const fit = document.getElementById('fit')
    const zoom = document.getElementById('zoom')
    const reheat = document.getElementById('reheat')

    let selected = thisfile

    const Graph = ForceGraph()(elem)
        .graphData(data)
        .nodeId('id')
        .nodeVal((n) => n.backlinks ? n.backlinks.length : 1)
        .nodeLabel('id')
        .nodeAutoColorBy('type')
        // .linkColor(d => data.nodes[d.source].exists ? 'red' : 'lightblue')
        .linkDirectionalArrowLength(6)
        .warmupTicks(1000)
        .d3AlphaMin(0.0001)
        .d3AlphaDecay(0.01)
        .d3VelocityDecay(0.01)
        .linkLabel( link => link.name)
        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
        .onNodeClick(node => {
          // Center/zoom on node
          selected = node.id
          nodeinfo.classList.add('show')
          title.innerHTML = node.title
          path.innerHTML = node.id
          link.href = node.id
          link.target = '__parent'
          Graph.centerAt(node.x, node.y, 1000);
          Graph.zoom(2, 2000);
        });

    fit.onclick = function() {
      Graph.zoomToFit(1000, 10, node => true)
    }

    zoom.onclick = function() {
      const { nodes, links } = Graph.graphData()
      const node = nodes.filter( n => n.id === selected)[0]
      Graph.centerAt(node.x, node.y, 1000);
      Graph.zoom(2, 1000);
    }

    reheat.onclick = function() {
      Graph.d3ReheatSimulation()
    }

    setTimeout( () => {
        const { nodes, links } = Graph.graphData()
        const node = nodes.filter( n => n.id === thisfile)[0]
        Graph.centerAt(node.x, node.y, 1000);
        Graph.zoom(2, 1000);
    }, 2000)


  </script>
  <style>
  #info {
    padding: 0.4em;
    background-color: rgba(255,255,255,0.5);
    position: absolute;
    top: 0;
    z-index: 999;
  }

  #node-info { 
    display: none;
  }
  #node-info.show {
    display: block;
  }

  #graph {
    position: absolute;
    top: 0px;
  }
  </style>
</body>`})
   return el
  }
