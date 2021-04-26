import { b64EncodeUnicode, b64DecodeUnicode } from './safe-encoders'
import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('fs/gh')

const getEndpoint = (opts,file) => `https://api.github.com/repos/${opts.username}/${opts.repository}/contents/${file}`

export const ghReadFile = opts => async (...args) => {
    const file = (opts.prefix || '') + args[0]
    const params = {
        method: "GET",
        headers: {
            "Authorization": `token ${opts.token}`,
            'Content-Type': 'application/json'
        },
    }
    const resp = await fetch(getEndpoint(opts,file), params)
    // resp.origJson = resp.json
    resp.text = async () => {
        console.log("ghReadFile text()...")
        const data = await resp.json()
        console.log("ghReadFile data", data)
        const content = b64DecodeUnicode(data.content)
        console.log("ghReadFile decoded", content)
        return content
    }
    console.log("ghReadFile", file, resp)
    return resp
}

export const ghWriteFile = (opts) => async (...args) => {
   
    const file = (opts.prefix || '') + args[0]
    const content = args[1].toString()
    console.log("ghWriteFile",file, content, args)
    const endpoint = getEndpoint(opts, file)
    const resp1 = await fetch(endpoint)
    const json1 = await resp1.json()
    console.log(endpoint, json1.sha ? "Exists, updating...":"Dosn't exist, creating...")
    const params = {
        method: "PUT",
        headers: {
            "Authorization": `token ${opts.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sha: json1.sha,
            message: opts.commitMessage || `Updated ${file}`,
            content: b64EncodeUnicode(content)
        })
    }
    console.log("ghWriteFile params", params)
    let resp2;
    try {
      resp2 = await fetch(endpoint, params)
    } catch(err) {
      console.log("ghWriteFile PUT failed", err)
    }
    return resp2 && resp2.status
}
