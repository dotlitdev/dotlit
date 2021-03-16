const React = require('react')
const ReactDOM = require('react-dom')
const parser = require('../parser')
const renderer = require('../renderer')
const App = require('../components/App').default
const vfile = require('vfile')
const path = require('path')
const FS = require('@isomorphic-git/lightning-fs')

const select = require('unist-util-select')

const litsrc = document.querySelector('meta[name="litsrc"]').getAttribute('value')
const litroot = document.querySelector('meta[name="litroot"]').getAttribute('value')
const baseUrl =`${location.protocol}//${location.host}${path.join(path.dirname(location.pathname), litroot)}`
const fs = new FS(baseUrl)

const lit = {
    location: {
        src: litsrc,
        root: litroot,
        base: baseUrl
    },
    parser,
    renderer,
    fs: fs.promises,
    utils: {
        select,
        path,
        vfile,
    }
}

if (typeof window !== 'undefined') window.lit = lit
console.log('.lit Notebook client initializing...')
console.log(`lit:`, lit)

;(async () => {

    console.log(`Checking local (${baseUrl}) filesystem for: ${litsrc}`)
    let file, stat;
    try { stat = await lit.fs.stat('/' + litsrc) } catch(err) {}
    if (stat) {
        console.log(`Local file "${ '/' + litsrc}" exists, loading that instead.`)
        const contents = await lit.fs.readFile('/' +  litsrc, {encoding: 'utf8'})
        file = await vfile({path: litsrc, contents})
    } else {
        console.log("Fetching file content", litroot, litsrc, path.join(litroot, litsrc))
        const contents = await (await fetch(path.join(litroot, litsrc))).text()
        file = await vfile({path: litsrc, contents})
    }
    
    const parsedFile = await parser.parse(file)
    console.log(parsedFile)
    window.lit.ast = parsedFile.data.ast

    try {
        lit.notebook = <App 
            fs={lit.fs}
            file={parsedFile}
            root={litroot}
            permalinks={{}}
            processor={renderer.processor()}
        />
    } catch(err) {
        console.error("Error instantiating App", err)
    }
    console.log('notebook', window.lit.notebook)
    
    try {
        ReactDOM.hydrate(window.lit.notebook, document.getElementById('app'))
    } catch (err) {
        console.error("Error hydrating App", err)
    }

   
})()


