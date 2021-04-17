import React, { useState } from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import Highlight from 'react-highlight.js'
import SelectionContext from '../SelectionContext'
import {getViewer} from '../../renderer/Viewers'
import {CodeMeta} from '../CodeMeta'
import { Identity } from '../../utils/functions'
import { ErrorBoundary } from '../ErrorBoundry'

const console = getConsoleForNamespace('codeblocks')

export const Codeblock = props => {
        
  const codeNode = props.node.children
    && props.node.children.length == 1
    && props.node.children[0].tagName === 'code'
    ? props.node.children[0] 
    : null;

  const [localRemote, setLocalRemote] = useState('local')
  const toggleLocalRemote = (ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    setLocalRemote(localRemote === 'local' ? 'remote' : 'local')
    return false
  }
  const [fullScreen, setFullScreen] = useState(false)
  const toggleFullscreen = (ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    setFullScreen(!fullScreen)
    return false
  }
  const [collapsed, setCollapsed] = useState(false)
  const toggleCollapsed = (ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    setCollapsed(collapsed ? 'uncollapsed' : 'collapsed')
    return false
  }


  return <SelectionContext.Consumer>
    { ctx => {

      const meta = codeNode ? codeNode.properties.meta : null
      const dirs = meta && meta.directives
      const tags = meta && meta.tags
      const dirClasses = dirs ? dirs.map(d=>'dir-'+d) : []
      const tagClasses = tags ? tags.map(t=>'tag-'+t) : []

      const Viewer = getViewer(meta, ctx.file.data.viewers)

      const classes = [
        ...dirClasses,
        ...tagClasses,
        localRemote,
        collapsed,
        fullScreen && 'fullscreen',
      ].filter(Identity).join(' ')
      
      if (codeNode) {
        let source;
        if (codeNode.data && codeNode.data.value) {
          source = codeNode.data.value;
        } else if (false && codeNode.children && codeNode.children[0]) {
          source = codeNode.children[0].value
        } else {
          console.log('unknown source')
          source = codeNode.value
        }
        codeNode.value = source

        const above = Viewer && meta.directives && (meta.directives.indexOf('above') >= 0)
        const below = Viewer && meta.directives && (meta.directives.indexOf('below') >= 0)

        console.log("[Codeblock]", meta && meta.raw, props )
        const highlighted = <Highlight language={meta.lang}>{source}</Highlight>
        const metaView = meta && <CodeMeta meta={meta} toggleCollapsed={toggleCollapsed} toggleFullscreen={toggleFullscreen} toggleLocalRemote={toggleLocalRemote} />
        return <codecell className={classes}>
            { meta && !above && metaView}
            { Viewer 
              ? <ErrorBoundary>
                  { below && !above && highlighted }
                  <Viewer children={props.children} node={codeNode} React={React}/>
                </ErrorBoundary>
              : meta && meta.isOutput
                ? <output>{highlighted}</output>
                : highlighted }
            { meta && above && metaView }
        </codecell>
      } else {
          console.log("Default codeblock", this.props.node.children[0])
          return <codecell><pre>{props.children}</pre></codecell>
      }
    }
  }</SelectionContext.Consumer>
}
