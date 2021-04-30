// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } }

postMessage("Location: " +  typeof location + JSON.stringify(location))
importScripts('../web.bundle.js')
postMessage("dotlit: " + typeof dotlit)
postMessage("lit" + JSON.stringify(dotlit.lit.location))

const getFsTest = async (filepath) => {
    postMessage(`Getting ${filepath} from local fs.`)
    try {
        const file = await dotlit.lit.fs.readFile(filepath)
        postMessage("length+" + file.length)
        postMessage('done')
    } catch(err) {
        postMessage("error:" + err.toString())
        postMessage('done')
    }
}

getFsTest('/index.lit')