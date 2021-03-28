const React = require('react')
const ReactDOM = require('react-dom')
const parser = require('../parser')
const renderer = require('../renderer')
const App = require('../components/App').default
const vfile = require('vfile')
const path = require('path')
const qs = require('querystring-es3')
const FS = require('@isomorphic-git/lightning-fs')

const select = require('unist-util-select')

const getMeta = (key,def) => {
    const el = document.querySelector(`meta[name="lit${key}"]`)
    const val = el ? el.getAttribute('value') : def
    return val
}
const query = qs.parse(location.search.slice(1))
const litsrc = getMeta('src', '')
const litroot = getMeta('root', '')
const litbase = getMeta('base', '/')
const baseUrl =`${location.protocol}//${location.host}${litroot ? path.join(path.dirname(location.pathname), litroot) : litbase}`
const fs = new FS(baseUrl)

const lit = {
    location: {
        src: litsrc,
        root: litroot,
        base: baseUrl,
        query: query,
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
    let src = litsrc
    if (src === '404.lit' && query.file) src = query.file
    console.log(`Checking local (${baseUrl}) filesystem for: ${src}`)
    let contents, file, stat;
    try { stat = await lit.fs.stat('/' + src) } catch(err) {}
    if (stat) {
        console.log(`Local file "${ '/' + src}" exists, loading that instead.`)
        contents = await lit.fs.readFile('/' +  src, {encoding: 'utf8'})
    } else {
        console.log("Fetching file content", litroot, litsrc, path.join(litroot, litsrc))
        contents = await (await fetch(path.join(litroot, litsrc))).text()
    }
    console.log(contents)
    file = await vfile({path: src, contents})

    
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


