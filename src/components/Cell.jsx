import React, {useState,useEffect} from "react"
import vfile from 'vfile'
import source from 'unist-util-source'
import filter from 'unist-util-filter'
import { atPos } from '../utils/unist-util-select-position'
import { selectAll } from 'unist-util-select'

import CellMenu from './CellMenu'
import SelectionContext from './SelectionContext'
import Editor from './Editor'
import {Repl} from '../repl'
import {processor} from '../renderer'

import { getConsoleForNamespace } from '../utils/console'
import { posstr } from '../utils/functions'

const console = getConsoleForNamespace('Cell')

const childIs = (node, nodeType) => (node && node.children 
    && node.children.length
    && node.children[0] 
    && node.children[0].tagName === nodeType) ? node.children[0] : null



const Cell = props => {

    const node = props.node
    node.position = node.position || {}
    const pos = node.position

    const [src, setSrc] = useState('')
    const [content, setContent] = useState(null)
    // const content = props.children
    const [editing, setEditing] = useState(false)
    const [executing, setExecuting] = useState(false)
    const toggleEditing = () => setEditing(!editing)
    
    const isSelected = ctx => {
        return ctx.selectedCell
            && ctx.selectedCell.start && ctx.selectedCell.end
            && atPos(ctx.selectedCell)(node)
            // && ctx.selectedCell.start.line === pos.start.line
            // && ctx.selectedCell.end.line === pos.end.line
    }
    const toggleSelected = ctx => () => {
        const selected = isSelected(ctx)
        console.log(`Toggle selected (was ${selected})`, ctx.selectedCell)
        ctx.setSelectedCell(selected ? null : pos)
    }
    

    const isCodeCell = childIs(props.node, 'pre')
    const codeNode = childIs(isCodeCell, 'code');
    const meta = codeNode ? codeNode.properties.meta : null
    const codeSource = codeNode && codeNode.data && codeNode.data.value
    const rawSource = codeSource && ("```" + (meta.raw || '') + "\n" + codeSource + "```")
    const originalSource = codeSource 
             && codeNode.properties
             && codeNode.properties.data
             && codeNode.properties.data.originalSource
    
    const output = meta && meta.isOutput

   

    const save = ctx => async args => {
        console.log("Saving cell", pos)
        const transform = meta && (meta.transformer || meta.lang)
        const transformer = lit.file?.data?.plugins?.transformer?.[transform]
        if (transformer) {
            const newSrc = await transformer({node, src, codeSource, rawSource, originalSource})
            ctx.setSrc(pos, newSrc)
        } else {
            ctx.setSrc(pos, src)
        }
        setEditing(false)
    }

    const exec = ctx => async args => {
        console.log('Executing cell', {pos, codeSource, rawSource, originalSource})
        setExecuting(true)
        const repl = meta.repl ? meta.repl : meta.lang
        let result
        let error
        if (lit?.file?.data?.plugins?.repl?.[repl]) {
            try { 
                 result = {stdout: await lit.file.data.plugins.repl[repl](codeSource, meta, node) } 
             } catch(err) { 
                 console.error("REPL plugin error", err)
                 error = true 
                 result = err
             }
        } else {
        try {
            const repl = new Repl()
            result = await repl.exec(codeSource, meta, node)
        } catch(res) {
            error = true
            console.log('REPL promise rejected', res)
            result = res
        }
        }
        console.log('Execution result', result)
        setExecuting(false)
        if (result && meta.react && result.resp && React.isValidElement(result.resp))
            setContent(result.resp)
        else if (result && meta.selfmutate && typeof result.resp === "string") {
            console.log("Experimental!! Special setSrc as cell is self mutating")
            // assumes source has changed in the filesystem 
            // so re-render from that
            if (ctx) ctx.setSrc(lit.ast.position, result.resp)
        } else {

            if (meta?.output?.filename) {
                console.log("TODO: write repl output to file system ")
                // lit.fs.writeFile(join(dirname(), meta?.output?.filename), result.stdout)
            }
            const outputMeta = (meta.hasOutput ? meta.output.raw : 'txt').trim() + (" attached=true updated=" + Date.now()) + (error ? ' !error' : '')
            const output = "\n```>"+ outputMeta +"\n" + result.stdout.replace(/\n```/g, "\n•••") + "\n```\n"
            if (ctx) ctx.setSrc(pos, rawSource + output)
            else return rawSource + output
        }
    }

    useEffect( async () => {
        if (meta && meta.exec === 'onload') {
            console.log("Onload execution")
            const output = await exec()()
            console.log("produced output", output)
            const outputVFile = await vfile({ path: meta.output?.filename || lit.location.src, contents: output})
            const result = await processor({fs: lit.fs,litroot: lit.location.root}).process(outputVFile)
            console.log("Result", result)
            setContent(result.result)
        }
    },[props.children])

    const getClasses = ctx => [
        isSelected(ctx) ? 'selected' : '',
        editing ? 'editing' : '',
        isCodeCell ? 'code' : '',
        output ? 'output' : '',
        executing ? 'executing' :'',
    ].join(' ').trim() || undefined

    return <SelectionContext.Consumer>
        { ctx => {
            // console.log("[Cell] code: ", !!isCodeCell, meta && meta.raw )//, codeNode, {src: codeSource, orig: originalSource}, ctx ) // meta, codeSource)
            const src = (meta && meta.remote && rawSource)
                        || source(pos, ctx.src)
            return <cell
                onClick={toggleSelected(ctx)}
                startpos={posstr(pos.start)}
                endpos={posstr(pos.end)}
                className={getClasses(ctx)}>
                    { editing ? <Editor src={src} update={setSrc}/> : <div className="cell-content">{content || props.children}</div> }
                    { isSelected(ctx) && <CellMenu meta={meta} editing={editing} toggleEditing={toggleEditing} save={save(ctx)} exec={exec(ctx)}/>}
            </cell>
        }}
    </SelectionContext.Consumer>
}

export default Cell