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


  return <SelectionContext.Consumer>
    { ctx => {

      const meta = codeNode ? codeNode.properties.meta : null
      const Viewer = getViewer(meta, ctx.file.data.viewers)

      const classes = [
        localRemote,
        fullScreen && 'fullscreen',
      ].filter(Identity).join(' ')
      
      if (codeNode) {
          const source = codeNode.children[0].value
          console.log("[Codeblock]", meta && meta.raw )
          return <codecell className={classes}>
              { meta && <CodeMeta meta={meta} toggleFullscreen={toggleFullscreen} toggleLocalRemote={toggleLocalRemote} /> }
              { Viewer 
                ? <ErrorBoundary>
                    <Viewer node={{value: source, data: {meta}}} React={React}/>
                  </ErrorBoundary>
                : meta && meta.isOutput
                  ? <output><Highlight language={meta.lang}>{source}</Highlight></output>
                  : <Highlight language={meta.lang}>{source}</Highlight> }
          </codecell>
      } else {
          console.log("Default codeblock", this.props.node.children[0])
          return <codecell><pre>{props.children}</pre></codecell>
      }
    }
  }</SelectionContext.Consumer>
}
