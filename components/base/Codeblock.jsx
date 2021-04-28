import React, { useState } from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import { DatesToRelativeDelta } from '../../utils/momento'
import Highlight from 'react-highlight.js'
import SelectionContext from '../SelectionContext'
import {getViewer} from '../../renderer/Viewers'
import {CodeMeta} from '../CodeMeta'

import { Identity } from '../../utils/functions'
import { ErrorBoundary } from '../ErrorBoundry'

const console = getConsoleForNamespace('codeblocks', {disabled: true})

const hasDirective = (meta, d) => {
  return meta && meta.directives && meta.directives.length && meta.directives.indexOf(d) >= 0
}


export const Codeblock = props => {
        
  const codeNode = props.node.children
    && props.node.children.length == 1
    && props.node.children[0].tagName === 'code'
    ? props.node.children[0] 
    : null;

  const meta = codeNode ? codeNode.properties.meta : null
  const dirs = meta && meta.directives
  const tags = meta && meta.tags
  const dirClasses = dirs ? dirs.map(d=>'dir-'+d) : []
  const tagClasses = tags ? tags.map(t=>'tag-'+t) : []

  const hasDirective = (d) => {
    return meta && meta.directives && meta.directives.length && meta.directives.indexOf(d) >= 0
  }

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

  const [collapsed, setCollapsed] = useState(hasDirective('collapse') ? 'collapsed' :  '')
  const toggleCollapsed = (ev) => {
    ev.stopPropagation()
    ev.preventDefault()
    setCollapsed(collapsed === 'collapsed' ? 'uncollapsed' : 'collapsed')
    return false
  }
  


  return <SelectionContext.Consumer>
    { ctx => {

      const Viewer = getViewer(meta, ctx.file.data.viewers)

      const classes = [
        ...dirClasses,
        ...tagClasses,
        meta && `lang-${meta.lang}`,
        localRemote,
        collapsed,
        fullScreen && 'fullscreen',
        meta && meta.isOutput && 'output'
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

        console.log(meta && meta.raw, props )
        const highlighted = <Highlight language={(meta && meta.lang) || "plaintext"}>{source}</Highlight>
        const metaView = meta && <CodeMeta meta={meta} toggleCollapsed={toggleCollapsed} toggleFullscreen={toggleFullscreen} toggleLocalRemote={toggleLocalRemote} />
        return <codecell className={classes}>
            { meta && !above && metaView}
            { Viewer 
              ? <ErrorBoundary>
                  { below && highlighted }
                  <Viewer children={props.children} node={codeNode} React={React} fullscreen={fullScreen}/>
                </ErrorBoundary>
              : meta && meta.isOutput
                ? <output>
                    {highlighted}
                  </output>
                : (!above && !below)
                   ? highlighted 
                   : null }
            { meta && above && metaView }
            { above && highlighted }
        </codecell>
      } else {
          console.log("Default codeblock", this.props.node.children[0])
          return <codecell><pre className="default">{props.children}</pre></codecell>
      }
    }
  }</SelectionContext.Consumer>
}
