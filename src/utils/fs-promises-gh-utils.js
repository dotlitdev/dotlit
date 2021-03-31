export const ghWriteFile = (opts) => async (...args) => {
    const file = args[0]
    const content = args[1]
    const endpoint = `https://api.github.com/repos/${opts.username}/${opts.repository}/contents/${}${file}`
    const resp1 = await fetch(endpoint)
    const json1 = await resp1.json()
    console.log(json1.sha ? "Exists, updating...":"Dosn't exist, creating...")
    const params = {
        method: "PUT",
        headers: {
            "Authorization": `token ${opts.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sha: json1.sha,
            message: opts.commitMessage || `Updated ${file}`,
            content: btoa(content)
        })
    }
    const resp2 = await fetch(endpoint, params)
    return resp2.status
}
