import path from 'path'

export const writeFileP = fs => async (...args) => {
    const filepath = args[0] = "/" + args[0]
    const p = path.parse(filepath)
    const parts = p.dir.split(path.sep)
    console.log(`"Parts for "${filepath}"`, parts)
    for (var i=0; i<parts.length; i++) {
        console.log(`[${i}] <--- "${parts[i]}"`)
        if (i === 0) {}
        else {
            const subPath = parts.slice(0, i  + 1).join(path.sep)
            console.log(`"${subPath}" Sub path`)
            try { 
                await fs.stat(subPath)
                console.log(`"${subPath}" Existed, skipping`)
            } catch (err) { 
                console.log(`"${subPath}" Didn't exist, creating...`)
                await fs.mkdir(subPath) }
        }
    }
    console.log("Writing file", ...args)
    return fs.writeFile(...args)
}