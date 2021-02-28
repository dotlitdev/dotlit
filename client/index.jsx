const React = require('react')
const ReactDOM = require('react-dom')
const parser = require('../parser')
const {App} = require('../renderer')
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
    const filecontents = await (await fetch(path.join(litroot, litsrc))).text()
    console.log('Fetched file contents:', filecontents)
    const file = await vfile({path: litsrc, contents: filecontents})
    console.log(file)
    const notebook = window.lit.notebook = <App 
        title={file.stem}
        src={file.contents.toString()}
        root={litroot}
        path={file.path}
        permalinks={{}}
    />
    console.log('notebook', notebook)
    
    ReactDOM.hydrate(notebook, document.getElementById('app'))
})()


