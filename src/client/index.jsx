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
const { ghWriteFile } = require('../utils/fs-promises-gh-utils.js')
const { getMeta } = require('../utils/functions')




const query = qs.parse(location.search.slice(1))
const litsrc = getMeta('src', '')
const litroot = getMeta('root', '')
const litbase = getMeta('base', '/')
const baseUrl =`${location.protocol}//${location.host}${litroot ? path.join(path.dirname(location.pathname), litroot) : litbase}`
const fs = (new FS(baseUrl)).promises 


const rf = fs.readFile
fs.readFile = async (...args) => {
  try {
    return await rf(...args)
  } catch (err) {
    return await (await fetch(path.join(litroot, args[0]))).text()
  }
}
const wf = fs.writeFile
const ghToken = localStorage.getItem('ghToken')
if (ghToken) fs.writeFile = async (...args) => {
  await wf(...args)
  const ghwf = ghWriteFile({
    username: 'dotlitdev',
    repository: 'dotlit',
    prefix: '/src',
    token: ghToken,
  })
  try {
    const ghResp = await ghwf(...args)
    console.log("GitHub write resp", ghResp)
  } catch(err) {
    console.error("GitHub write threw", err)
  }
}

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

    
    const processedFile = await renderer.processor(fs).process(file)
    console.log("Processed client", processedFile)
    window.lit.ast = processedFile.data.ast

    try {
        lit.notebook = <App 
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
    } catch (err) {
        console.error("Error hydrating App", err)
    }

   
})()


