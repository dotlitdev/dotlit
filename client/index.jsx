const React = require('react')
const ReactDOM = require('react-dom')
const vfile = require('vfile')
const path = require('path')
const qs = require('querystring-es3')
const FS = require('@isomorphic-git/lightning-fs')
const git = require('isomorphic-git')
const select = require('unist-util-select')

const parser = require('../parser')
const renderer = require('../renderer')
const { Repl } = require('../repl')

const { Header } = require('../components/Header')
const { extendFs } = require('../utils/fs-promises-utils')
const { DatesToRelativeDelta, MsToRelative } = require('../utils/momento')

const { getMeta } = require('../utils/functions')
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('client')

const hasLocation = typeof location !== "undefined"

const query = hasLocation ? qs.parse(location.search.slice(1)) : {}
const litsrcMeta = getMeta('src', '')
const litsrc = (litsrcMeta === '404.lit' && query.file) ? query.file : litsrcMeta
const litroot = getMeta('root', '/')
// const litbase = getMeta('base', '/')
const litbase = (!hasLocation || litroot === '/')
                 ? litroot 
                 : path.join(path.dirname(location.pathname), litroot)
const baseUrl = hasLocation && `${location.protocol}//${location.host}${litbase}`

const lfs = new FS(baseUrl, {
    wipe: query.__lfs_wipe==="true" ? confirm("Are you sure you want to wipe the local file system: " + baseUrl) : undefined,
    url: baseUrl,
})
const fs = extendFs(lfs.promises, litroot, typeof localStorage !== "undefined" && localStorage.getItem("ghToken") && {
    username: "dotlitdev",
    repository: "dotlit", 
    prefix: "src",
    token: localStorage.getItem("ghToken"),
})


export const lit = {
    location: {
        src: litsrc,
        root: litroot,
        base: baseUrl,
        query: query,
    },
    parser,
    renderer,
    Repl,
    fs, lfs, git,
    utils: {
        React,
        select,
        path,
        vfile,
        delete: async (fp) => {
            const f = fp || litsrc
            const filepath = f[0] === '/' ? f : ('/' + f)
            console.log(`Removing local file: "${filepath}"`)
            await lit.fs.unlink(filepath)
            console.log(`Unlinked: "${filepath}"`)
        },
        read: async (fp) => {
            const f = fp || litsrc
            const filepath = f[0] === '/' ? f : ('/' + f)
            const resp = await lit.fs.readStat(filepath, {encoding: 'utf8'})
            console.log(`Loaded file: ${filepath} local: ${!!resp.local.stat} remote: ${!!resp.remote.stat} resp: `, resp)

            if (resp.local.stat && resp.remote.stat) {
                const ageMessage = DatesToRelativeDelta(resp.local.stat.mtimeMs, resp.remote.stat.mtimeMs)
                console.log(`Local file is ${ageMessage} than remote file.`)
            }
        },
    }
}

lit.u = lit.utils

if (typeof window !== 'undefined') window.lit = lit

console.log(`lit:`, lit)

export const init = async () => {
    if(query.__lit_no_client==="true") return;

    console.log('.lit Notebook client initializing...')

    const App = require('../components/App').default

    const filepath = `/${lit.location.src}`
    console.log(`Checking local (${baseUrl}) filesystem for: ${filepath}`)
    let contents, times = {local: null, remote: null}
    try {
        const resp = await lit.fs.readStat(filepath, {encoding: 'utf8'})
        console.log(`Loaded file: ${filepath} local: ${!!resp.local.stat} remote: ${!!resp.remote.stat} resp: `, resp)
        times.local = resp.local.stat && MsToRelative(resp.local.stat.mtimeMs - Date.now())
        times.remote = resp.remote.stat && MsToRelative(resp.remote.stat.mtimeMs - Date.now())

        if (resp.local.stat && resp.remote.stat) {
            const ageMessage = DatesToRelativeDelta(resp.local.stat.mtimeMs, resp.remote.stat.mtimeMs)
            times.ageMessage = ageMessage
            console.log(`Local file is ${ageMessage} than remote file.`)
        }
        
        contents = resp.local.value || resp.remote.value
    } catch(err) {
        console.error(`Error fething local or remote file`, err)
        console.log(`Showing 404 page`)
        // const resp404 = await lit.fs.readStat( '/' + path.join(litroot, "404.lit") )
        // contents = resp404.value
        contents = `# ${lit.location.src}\n\nFile not *yet* found, edit this to change that.`
    }
  
    const file = await vfile({path: filepath, contents})
    file.data.times = times
    
    const processedFile = await renderer.processor({fs,litroot}).process(file)
    console.log("Processed client", processedFile)
    window.lit.ast = processedFile.data.ast
    window.lit.file = processedFile

    try {
        lit.notebook = <App
            root={litroot}
            fs={lit.fs}
            file={processedFile}
            result={processedFile.result}
        />
    } catch(err) {
        console.error("Error instantiating App", err)
    }
    console.log('notebook', window.lit.notebook)
    
    try {
        ReactDOM.render(window.lit.notebook, document.getElementById('lit-app'))
        // ReactDOM.hydrate(window.lit.notebook, document.getElementById('app'))
        // ReactDOM.hydrate(<Header root={litroot} />, document.getElementById('header'))
    } catch (err) {
        console.error("Error hydrating App", err)
    }
}

if (typeof WorkerGlobalScope !== 'undefined'
    && self instanceof WorkerGlobalScope) {
   pushMessage("dotlit worker")
} else {
   init()
}
