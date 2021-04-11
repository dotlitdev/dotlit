import React from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import Highlight from 'react-highlight.js'
import SelectionContext from '../SelectionContext'
import {getViewer} from '../../renderer/Viewers'
import {CodeMeta} from '../CodeMeta'

const console = getConsoleForNamespace('codeblocks')

export const Codeblock = props => {
        
        const codeNode = props.node.children
                            && props.node.children.length == 1
                            && props.node.children[0].tagName === 'code'
                            ? props.node.children[0] 
                            : null;
       

        return <SelectionContext.Consumer>
        { ctx => {

        const meta = codeNode ? codeNode.properties.meta : null
        const viewer = getViewer(meta, ctx.file.data.viewers)

       
        if (codeNode) {const source = codeNode.children[0].value
            console.log("[Codeblock]", meta, viewer)
            return <codecell>
                { meta && <CodeMeta meta={meta}/> }
                { viewer 
                  ? viewer({value: source, data: {meta}}, {React})
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
