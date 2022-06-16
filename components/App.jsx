import React, {useState, useEffect} from 'react'
import path from 'path'
import SelectionContext from './SelectionContext'
import { Header } from './Header'
import Editor from './Editor'
import Highlight from 'react-highlight.js'
import source from 'unist-util-source'
import patchSource from '../utils/unist-util-patch-source'
import { processor } from '../renderer'
import {utils as parserUtils} from '../parser'
import { getConsoleForNamespace } from '../utils/console'
import filter from 'unist-util-filter'
import { atPos } from '../utils/unist-util-select-position'
import { selectAll } from 'unist-util-select'
import { posstr } from '../utils/functions'
import { ErrorBoundary } from './ErrorBoundry'

const console = getConsoleForNamespace('App')

const {toMarkdown, ungroupSections} = parserUtils

const ONLOAD = "onload"
const ONSAVE = "onsave"
const ONSELECT = "onselect"

const onLifecyclePlugins = async (file, type, ...args) => {
    const plugins = file?.data?.plugins?.[type] || {}
    const keys = Object.keys(plugins)
    console.log(`[${type}] plugins: ${keys.length}`)
    for (const key of keys) {
        if (typeof plugins[key] === 'function') {
            await plugins[key](...args)
        }
    }
}

const ast2md = (ast) => {
  const unGroup = ungroupSections()()
  const tree = unGroup(ast)
  const md = toMarkdown(tree)
  return md
}

const App = ({root, file, fs, result, files, ssr}) => {

    const [srcAndRes, setSrcAndRes] = useState({
        src: file.contents.toString(),
        res: result
    })

    const [res, setResult] = useState(result)
    const [selectedCell, setSelectedCell] = useState(null)
    
    const [viewSource, setViewSource] = useState(false)
    const toggleViewSource = () => setViewSource(!viewSource)

    const [modal, setModal] = useState(false)
    const toggleModal = (val) => setModal(val)


    const themePlugins = file?.data?.plugins?.theme
    const themes = themePlugins && Object.keys(themePlugins).map(t=>({id: t, ...themePlugins[t]}))
    
    const setSrcWrapper = async (pos, cellSource) => {
        try {
        console.log("<App/> Set src wrapper", posstr(pos.start), posstr(pos.end))
        const patchedSrc = patchSource(srcAndRes.src, pos, cellSource.trimEnd())
        if (patchedSrc === srcAndRes.src) {
            console.log("No Change to source of document. Not updating.")
            return;
        }
        
        file.contents = patchedSrc
        file.messages = []
        const processedFile = await processor({fs, files}).process(file)
        console.log("Processed clientside on setSrc", file.path, processedFile)

        await onLifecyclePlugins(processedFile, ONSAVE, patchedSrc, processedFile, processedFile.data.ast)

        if (typeof window !== 'undefined') {
            window.lit.file = processedFile
            window.lit.ast = processedFile.data.ast
        }
      
        try {
            await fs.writeFile(file.path, patchedSrc, {encoding: 'utf8'})
        } catch (err) {
            console.log("Failed to write file source to fs", file.path, err)
        }
        
        const tmpEnd = {line: pos.start.line + cellSource.split('\n').length }
        const tmpPos = {start: pos.start, end: tmpEnd }
        const tree = filter(processedFile.data.ast, atPos(tmpPos))
        const nodes = selectAll('code', tree)
        console.log("[CodeCells in Change (pos)]", tmpPos, file.path, tree, nodes)
        for (const codeCell of nodes) {
            const meta = codeCell.data && codeCell.data.meta && codeCell.data.meta
            const filename = meta && (meta.filename) //|| meta.source?.filename)
            const extract = filename && (meta.isOutput) && meta.extract !== 'false'
            const content = source(codeCell.position, patchedSrc).split('\n').slice(1,-1).join('\n')
            if (extract) {
                const filepath = path.join( path.dirname(file.path), filename)
                await fs.writeFile(filepath, content)
                console.log(`Wrote codefile ${filename} to "${filepath}" on disk`)
            } else {
                console.log(`Not writing code cell to fs`,filename, extract, codeCell)
            }
       }

       setSrcAndRes({
            src: patchedSrc,
            res: processedFile.result
       })
       setSelectedCell(tmpPos)
       } catch (err) {
           console.log("failed to setSrc", pos, cellSource, err)
       }
    }

    const setSelectedCellWrapper = async (pos, scroll) => {
        console.log("Selected Cell:", pos)
        await onLifecyclePlugins(window.lit.file, ONSELECT, pos, scroll)
        setSelectedCell(pos)
        if (pos && scroll) {
            document.querySelector(`[startpos="${posstr(pos.start)}"]`).scrollIntoViewIfNeeded()
        }
    }

    const state = {
        fs: fs,
        file: file,  
        src: srcAndRes.src, 
        selectedCell, 
        setSelectedCell: setSelectedCellWrapper, 
        setSrc: setSrcWrapper,
        ast2md,
    }

    useEffect( async fn => {
       await onLifecyclePlugins(file, ONLOAD, state)
    },[])

    console.log(`Render "${file.path}" (selected: ${selectedCell} `)

    return <SelectionContext.Provider value={state}>
        <ErrorBoundary>{ <Header root={root} toggleViewSource={toggleViewSource} toggleModal={toggleModal} ssr={ssr}/> }</ErrorBoundary>
        {themes && themes.map( theme => {
           return theme.url 
               ? <link key={theme.id} rel="stylesheet" href={theme.url}/>
               : <style key={theme.id} dangerouslySetInnerHTML={{__html: theme.value}}></style>
        })}
        <div id="content">
          { modal
            ? <ErrorBoundary>{modal}</ErrorBoundary>
            : viewSource 
              ? <ErrorBoundary><Highlight language="md">{srcAndRes.src}</Highlight></ErrorBoundary>
              : <ErrorBoundary>{srcAndRes.res}</ErrorBoundary> }
        </div>
    </SelectionContext.Provider>
}

export default App
