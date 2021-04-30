// gross hack around one of codemirror/view bugs
let document = { documentElement: { style: {} } }

importScripts('../web.bundle.js')
postMessage("dotlit: " + typeof dotlit)
console.log("anyone here?")