const React = require('react')
const ReactDOM = require('react-dom')
const parser = require('../parser')
const renderer = require('../renderer')
const App = require('../components/App').default
const vfile = require('vfile')
const path = require('path')
const FS = require('@isomorphic-git/lightning-fs')

const litsrc = document.querySelector('meta[name="litsrc"]').getAttribute('value')
const litroot = document.querySelector('meta[name="litroot"]').getAttribute('value')
const baseUrl =`${location.protocol}//${location.host}${path.join(path.dirname(location.pathname), litroot)}`
const fs = new FS(baseUrl)

window.lit = {
    path, parser, App, vfile, fs, litsrc, litroot, baseUrl
}

console.log('.lit Notebook client initializing...')
console.log(`litsrc:`, litsrc)
console.log(`litroot:`, litroot)
console.log(`baseUrl:`, baseUrl)
console.log(`lit:`, window.lit)

;(async () => {
    console.log("Fetching file content", litroot, litsrc, path.join(litroot, litsrc))
    const filecontents = await (await fetch(path.join(litroot, litsrc))).text()
    console.log('Fetched file contents:', filecontents)
    const file = await vfile({path: litsrc, contents: filecontents})
    console.log(file)
    try {
    window.lit.notebook = <App 
        title={file.stem}
        src={file.contents.toString()}
        root={litroot}
        path={file.path}
        permalinks={{}}
        processor={renderer.processor(litroot, file.path)}
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

    console.log( parser.processor().processSync(file))
})()


