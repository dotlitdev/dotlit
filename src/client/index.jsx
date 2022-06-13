// IOS indexDB bug workaround
const idb = indexedDB

const {time, getTimings} = require('../utils/timings')

time('client')
const React = require('react')
const ReactDOM = require('react-dom')
const vfile = require('vfile')
const path = require('path')
const qs = require('querystring-es3')
const FS = require('@isomorphic-git/lightning-fs')
const git = require('isomorphic-git')
const compactPrefixTree = require('compact-prefix-tree')
const mime = require('mime-types')
const pkg = require('../../package.json')

const select = require('unist-util-select')
const source = require('unist-util-source')
const filter = require('unist-util-filter')
const visit = require('unist-util-visit')
const patchSource = require('../utils/unist-util-patch-source')
const selectPosition = require('../utils/unist-util-select-position')

const { to_string } = require('../parser/utils/mdast-util-to-string')

const parser = require('../parser')
const renderer = require('../renderer')
const { Repl, transform } = require('../repl')

const { Header } = require('../components/Header')
const { extendFs } = require('../utils/fs-promises-utils')
const momento = require('../utils/momento')
const colors = require('../utils/colors')
const safeEncoders = require('../utils/safe-encoders')

const { inspect } = require('util')
const diff = require('diff')
const fns = require('../utils/functions')
import { getConsoleForNamespace } from '../utils/console'
import {setupGithubAccess} from '../utils/github'

const console = getConsoleForNamespace('client')

const  { DatesToRelativeDelta, MsToRelative } = momento

time('client', 'importsComplete')

const hasLocation = typeof location !== "undefined"
const litLocation = getLitLocation()

function getLitLocation () {
    const query = hasLocation ? qs.parse(location.search.slice(1)) : {}
    const litsrcMeta = fns.getMeta('src', '')
    const litsrc = (litsrcMeta === '/404.lit')
                    ? (query.file || location.pathname.replace(/\.html$/, '.lit').slice(1))
                    : litsrcMeta
    const litroot = fns.getMeta('root', '/')
    const litbase = (!hasLocation || litroot === '/')
                    ? litroot 
                    : path.join(path.dirname(location.pathname), litroot);
    const baseSuffix = litbase.slice(-1) === '/' ? '' : '/';
    const baseUrl = hasLocation && `${location.protocol}//${location.host}${litbase}${baseSuffix}`
    return {
        src: litsrc,
        root: litroot,
        base: baseUrl,
        query: query,
    }
}

const lfs = new FS(litLocation.base, {
    wipe: litLocation.query.__lfs_wipe==="true" ? confirm("Are you sure you want to wipe the local file system: " + litLocation.base) : undefined,
    url: litLocation.base,
})

let ghSettings
if (typeof localStorage !== 'undefined') {
  try {
    ghSettings = JSON.parse(localStorage.getItem('ghSettings'))
  } catch(err) {}
}
const fs = extendFs(lfs.promises, litLocation.root, !litLocation.query.__no_gh && ghSettings)

time('client', 'fsSetup')

export const lit = {
    version: pkg.version,
    location: litLocation,
    getTimings,
    parser,
    renderer,
    Repl,
    config: {
        setupGithubAccess
    },
    fs, lfs, git,
    utils: {
        transform,
        inspect,
        compactPrefixTree,
        diff,
        mime,
        React,
        ReactDOM,
        unist: {
            select,
            source,
            filter,
            visit,
            patchSource,
            selectPosition,
        },
        mdast: {
            to_string,
        },
        momento,
        colors,
        safeEncoders,
        fns,
        path,
        querystring: qs,
        vfile,
        delete: async (fp) => {
            const f = fp || litLocation.src
            const filepath = f[0] === '/' ? f : ('/' + f)
            console.log(`Removing local file: "${filepath}"`)
            await lit.fs.unlink(filepath)
            console.log(`Unlinked: "${filepath}"`)
        },
        read: async (fp) => {
            const f = fp || litLocation.src
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

time('client', 'litObj')

export const init = async () => {
    if(lit.location.query.__lit_no_client==="true") return;

    console.log('.lit Notebook client initializing...')
    time('client', 'initStart')

    const App = require('../components/App').default

    const filepath = lit.location.src
    console.log(`Checking local (${lit.location.base}) filesystem for: ${filepath}`)
    let contents, stats;
    let times = {local: null, remote: null}
    try {
        const resp = await lit.fs.readStat(filepath, {encoding: 'utf8'})
        console.log(`Loaded file: ${filepath} local: ${!!resp.local.stat} remote: ${!!resp.remote.stat} resp: `, resp)
        times.local = resp.local.stat && MsToRelative(resp.local.stat.mtimeMs - Date.now())
        times.remote = resp.remote.stat && MsToRelative(resp.remote.stat.mtimeMs - Date.now())

        if (resp.local.stat && resp.remote.stat) {
            const ageMessage = DatesToRelativeDelta(resp.local.stat.mtimeMs, resp.remote.stat.mtimeMs)
            times.ageMessage = ageMessage
            stats = window.lit.stats = resp
            console.log(`Local file is ${ageMessage} than remote file.`)
        }
        
        contents = resp.local.value || resp.remote.value
    } catch(err) {
        console.error(`Error fetching local and remote file`, err)

        
        if (lit.location.query.template) {
            console.log(`Loading template (${lit.location.query.template}) for 404 file "${lit.location.src}".`)
            try {
                const template = await lit.fs.readStat(lit.location.query.template, {encoding: 'utf8'})
                contents = lit.utils.fns.template(template.local.value || template.remote.value, window)
            } catch (err) {
                console.error(`Failed to load template: ${lit.location.query.template}`, err)
            }
        } else if (lit.location.query.title || lit.location.query.body) {
            contents = lit.location.query.title ? `# ${lit.location.query.title}\n\n${lit.location.query.body||''}` : lit.location.query.body || ''
        }
        
        console.log(`Showing 404 page`)
        const filename = lit.utils.path.basename(lit.location.src).slice(0, 0-lit.utils.path.extname(lit.location.src).length)
        if (!contents) contents = `# ${lit.location.src}\n\nFile not *yet* found, edit this to change that.`
    }
    time('client', 'readFile')
   
    const file = await vfile({path: filepath, contents})
    file.data = file.data || {}
    file.data.times = times

    window.lit.files = await fetch(lit.location.base + 'compactManifest.json')
                          .catch(err=>([]))
                          .then(res => res.json().then( data => {
                              return Array.from(lit.utils.compactPrefixTree.getWordsFromTrie(data)).map(x=>'/'+x)
                          }))

    window.lit.manifest = await fetch(lit.location.base + 'manifest.json')
                            .catch(err=>({}))
                            .then(res => res.json().then( data => {
                                return data;
                            }))
    time('client', 'manifestLoaded')
    const processedFile = await renderer.processor({fs,litroot: lit.location.root, files: lit.files}).process(file)
    if (stats) {
        const remoteNewer = stats.local.stat.mtimeMs < stats.remote.stat.mtimeMs
        const hasDiff = stats.local.value !== stats.remote.value
        if (remoteNewer && hasDiff) {
           const delta = DatesToRelativeDelta(stats.local.stat.mtimeMs, stats.remote.stat.mtimeMs) 
           if (delta !== 'now') processedFile.message(`Local file is ${delta} than Remote file. (has Diff)`)
        }
    }

    console.log("Processed clientside ", file.path)
    window.lit.ast = processedFile.data.ast
    window.lit.file = processedFile

    time('client', 'processedFile')
    try {
        lit.notebook = <App
            root={lit.location.root}
            fs={lit.fs}
            file={processedFile}
            result={processedFile.result}
            files={lit.files}
        />
    } catch(err) {
        console.error("Error instantiating App", err)
    }
    console.log('notebook', window.lit.notebook)
    
    try {
        ReactDOM.hydrate(window.lit.notebook, document.getElementById('lit-app'))
    } catch (err) {
        console.error("Error hydrating App", err)
    }
    time('client', 'rendered')
}

if (typeof WorkerGlobalScope !== 'undefined'
    && self instanceof WorkerGlobalScope) {
   // inside worker as lib, don't init.
} else {
   init()
}
