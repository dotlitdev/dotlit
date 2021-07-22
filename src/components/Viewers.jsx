import React, {useEffect} from 'react'
import { getConsoleForNamespace } from '../utils/console'
import {btoa} from '../utils/safe-encoders'

import {viewer as mdViewer} from '../plugins/viewers/md'
import {viewer as graphViewer} from '../plugins/viewers/graph'

const console = getConsoleForNamespace('Viewers')

const lit = typeof window !== 'undefined' ? window.lit : {}

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
  img: ({node}) => {
    const path = node?.properties?.meta?.uri || node?.properties?.meta?.filename
    return path 
      ? <img src={path} {...node?.properties?.meta?.attr}/>
      : <div {...node?.properties?.meta?.attr} dangerouslySetInnerHTML={{__html: node.value}}></div>
  },
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
  script: ({node}) => {
    const path = node?.properties?.meta?.uri || node?.properties?.meta?.filename
    useEffect(() => {
      const script = document.createElement('script');

      if (path) script.src = path
      else script.innerHTML = node.value
      const body = typeof document !== "undefined" && document.body
      script.async = true;
      body && body.appendChild(script);

      return () => {
        body && body.removeChild(script);
      }
    }, []);
    return <div className="scriptLoaded"></div>// path 
      // ? <script src={path} {...node?.properties?.meta?.attr}></script>
      // : <script {...node?.properties?.meta?.attr} dangerouslySetInnerHTML={{__html: node.value}}></script>
  },
  style: ({node}) => {
    const path = node?.properties?.meta?.uri || node?.properties?.meta?.filename
    return path 
      ? <link rel="stylesheet" href={path} {...node?.properties?.meta?.attr}/>
      : <style {...node?.properties?.meta?.attr} dangerouslySetInnerHTML={{__html: node.value}}></style>
  },
}

const hasViewDirective = meta => {
  const has = d => meta.directives && meta.directives.indexOf(d) >= 0
  return has('inline') 
         || has('above') 
         || has('below')
}

export const getViewer = (meta, customViewers = {}) => {
  const view = meta && (meta.viewer || meta.lang)
  const CustomViewer = customViewers[view]
  const useViewer = view && (meta.viewer || meta.isOutput 
       || hasViewDirective(meta))
  const viewer = CustomViewer || viewers[view]
  const enabled = view && useViewer && viewer

  if (enabled) console.log(`[Viewer] view: ${view} custom: ${!!CustomViewer} use: ${!!useViewer}`)
  return enabled
  }
