import React from 'react'
import {log, level} from '../../utils/console'
import { getConsoleForNamespace } from '../../utils/console'
import Highlight from 'react-highlight.js'

import {getViewer} from '../../renderer/Viewers'
import {CodeMeta} from '../CodeMeta'

const console = getConsoleForNamespace('codeblocks')

export default class Codeblock extends React.Component {
    render() {
        
        const codeNode = this.props.node.children
                            && this.props.node.children.length == 1
                            && this.props.node.children[0].tagName === 'code'
                            ? this.props.node.children[0] 
                            : null;
        const meta = codeNode ? codeNode.properties.meta : null
        const viewer = getViewer(meta)

       
        if (codeNode) {const source = codeNode.children[0].value
            console.log("[Codeblock]", meta)
            return <codecell>
                { meta && <CodeMeta meta={meta}/> }
                { viewer 
                  ? viewer({value: source})
                  : meta && meta.isOutput
                    ? <output><Highlight language={meta.lang}>{source}</Highlight></output>
                    : <Highlight language={meta.lang}>{source}</Highlight> }
            </codecell>
        } else {
            console.log("Default codeblock", this.props.node.children[0])
            return <codecell><pre>{this.props.children}</pre></codecell>
        }
    }
}
