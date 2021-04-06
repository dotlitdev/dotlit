const React = require('react')
const ReactDOM = require('react-dom')
const vfile = require('vfile')
const path = require('path')
const qs = require('querystring-es3')
const FS = require('@isomorphic-git/lightning-fs')
const select = require('unist-util-select')

const parser = require('../parser')
const renderer = require('../renderer')
const App = require('../components/App').default
const { Header } = require('../components/Header')
const { extendFs } = require('../utils/fs-promises-utils')

const { getMeta } = require('../utils/functions')
import { getConsoleForNamespace } from '../utils/console'

const console = getConsoleForNamespace('client')

const query = qs.parse(location.search.slice(1))
const litsrcMeta = getMeta('src', '')
const litsrc = (litsrcMeta === '404.lit' && query.file) ? query.file : litsrcMeta
const litroot = getMeta('root', '')
const litbase = getMeta('base', '/')
const baseUrl =`${location.protocol}//${location.host}${litroot ? path.join(path.dirname(location.pathname), litroot) : litbase}`

const lfs = (new FS(baseUrl)).promises 
const fs = extendFs(lfs, litroot)


const lit = {
    location: {
        src: litsrc,
        root: litroot,
        base: baseUrl,
        query: query,
    },
    parser,
    renderer,
    fs,
    utils: {
        select,
        path,
        vfile,
        delete: async (fp) => {
           const f = fp || litsrc
           console.log("Removing local file:", f)
           await lit.fs.unlink('/' + f)
           console.log("Unlinked:",f)
        },
        read: async (fp) => {
           const f = fp || litsrc
           console.log("Getting Stat and Reading local file:", f)
           const resp = await lit.fs.readStat('/' + f)
           console.log("readStat:",f,resp)
        },
    }
}

lit.u = lit.utils

if (typeof window !== 'undefined') window.lit = lit
console.log('.lit Notebook client initializing...')
console.log(`lit:`, lit)

;(async () => {
    
    console.log(`Checking local (${baseUrl}) filesystem for: ${lit.location.src}`)
    let contents, file;


    try {
        const resp = await lit.fs.readStat('/' +  lit.location.src, {encoding: 'utf8'})
        contents = resp.value
    } catch(err) {
        console.error(`Error 404 File not found local or remote`)
        // const resp404 = await lit.fs.readStat( '/' + path.join(litroot, "404.lit") )
        // contents = resp404.value
        contents = `# ${lit.location.src}\n\nFile not yet found, edit this to change that.`
    }
  
    console.log(contents)
    file = await vfile({path: lit.location.src, contents})

    
    const processedFile = await renderer.processor(fs).process(file)
    console.log("Processed client", processedFile)
    window.lit.ast = processedFile.data.ast

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
        ReactDOM.hydrate(window.lit.notebook, document.getElementById('app'))
        // ReactDOM.hydrate(<Header root={litroot} />, document.getElementById('header'))
    } catch (err) {
        console.error("Error hydrating App", err)
    }

   
})()
