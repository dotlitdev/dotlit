import { b64EncodeUnicode } from './safe-encoders'
import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('fs')

const getEndpoint = (opts,file) => `https://api.github.com/repos/${opts.username}/${opts.repository}/contents/${file}`

export const ghReadFile = opts => async (...args) => {
    const file = (opts.prefix || '') + args[0]
    const resp = await fetch(getEndpoint(opts,file))
    console.log("ghReadFile", file, resp)
    return resp && resp.status
}

export const ghWriteFile = (opts) => async (...args) => {
    console.log(args)
    const file = (opts.prefix || '') + args[0]
    const content = args[1].toString()
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
    console.log("params", params)
    let resp2;
    try {
      resp2 = await fetch(endpoint, params)
    } catch(err) {
      console.log("PUT failed", err)
    }
    return resp2 && resp2.status
}
