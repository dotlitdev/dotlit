import path from "path";
import { ghWriteFile, ghReadFile } from "../utils/fs-promises-gh-utils";
import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('fs')

const passThroughRead = (origReadFile, litroot) => {
  
  return async (...args) => {
    console.log('fs.passThroughRead', args[0])
    try {
      return await origReadFile(...args);
    } catch (err) {
      const filePath = path.join(litroot, args[0])
      console.log('fs.passThroughRead passing through to fetch', filePath)
      const resp = await fetch(filePath)
      if (resp.status === 404) throw new Error(`404 File ${filePath} not found.`)
      return await resp.text();
    }
  };
}

const passThroughReadWithStat = (origReadFile, origStat, litroot, ghOpts) => {

  return async (...args) => {
    console.log('fs.passThroughReadWithStat', args[0])

    const resp = {
      local: { stat: undefined, value: undefined },
      remote: { stat: undefined, value: undefined },
    }
    try {
      try {
        resp.local.stat = await origStat(...args)
      } catch(err){
        console.log("fs.passThoughReadWithStat no stat on local file")
      }
      const value = await origReadFile(...args)
      resp.local.value = value
    } catch (err) { 
      console.log('fs.passThoughReadWithStat no local file', err)
    }

    const filePath = path.join(litroot, args[0])

    let remoteResp
    if (ghOpts) {
        console.log("fs.passThroughtReadWithStat passing through to GitHub", filePath)
        const ghrf = ghReadFile(ghOpts)
        try {
             remoteResp = await ghrf(filePath)
        } catch(err){
             console.log("fs.passThroughtReadWithStat GitHub read failed", err) 
        }
    } else {
        console.log('fs.passThroughReadWithStat passing through to fetch', filePath)
        remoteResp = await fetch(filePath)
    }

    if (!remoteResp || remoteResp.status < 200 || remoteResp.status >= 400) {
      if (!resp.local.stat && !resp.local.value) {
        console.log('fs.passThroughReadWithStat failed local and remote read')
        throw new Error(`${remoteResp.status} Error. Fetching File.`)
      }
    } else {
      console.log("fs.passThroughReadWithStat found remote file")
      const value = await remoteResp.text()
      const lastModified = remoteResp.headers && remoteResp.headers.get('last-modified')
      const contentLength = remoteResp.headers && remoteResp.headers.get('content-length')
      const stat = {
        dev: 1,
        gid: 1,
        ino: 1,
        uid: 1,
        mtimeMs: lastModified && (new Date(lastModified)).getTime(),
        size: contentLength,
      }
      resp.remote = {stat,value}
    }

    return resp
  };
}

const writeFileP = (fs, litroot) => {
  const wf = fs.writeFile
  return async (...args) => {
    console.log("fs.writeFileP")
    const filepath = (args[0] = litroot + args[0]);
    const p = path.parse(filepath);
    const parts = p.dir.split(path.sep);
    // console.log(`"Parts for "${filepath}"`, parts);
    for (var i = 0; i < parts.length; i++) {
      // console.log(`[${i}] <--- "${parts[i]}"`);
      if (i === 0) {
      } else {
        const subPath = parts.slice(0, i + 1).join(path.sep);
        // console.log(`"${subPath}" Sub path`);
        try {
          await fs.stat(subPath);
          console.log(`[fs.writeFileP] "${subPath}" Existed, skipping`);
        } catch (err) {
          console.log(`[fs.writeFileP] "${subPath}" Didn't exist, creating...`);
          await fs.mkdir(subPath);
        }
      }
    }
    // console.log("[fs.writeFileP] Writing file", ...args);
    return wf(...args);
  };
}

const passThroughWrite = (fs,litroot, ghOpts) => {
  const wf = fs.writeFile
  return async (...args) => {
    console.log('fs.passThroughWrite')
    await wf(...args);
    const ghwf = ghWriteFile(ghOpts);
    try {
      const ghResp = await ghwf(...args);
      console.log("GitHub write resp", ghResp);
    } catch (err) {
      console.error("GitHub write threw", err);
    }
  };
}

export const extendFs = (fs, litroot = "", ghOpts) => {
  const origReadFile = fs.readFile
  const origStat = fs.stat
  fs.readFile = passThroughRead(origReadFile,litroot);
  fs.writeFile = writeFileP(fs);
  fs.readStat = passThroughReadWithStat(fs.readFile, origStat, litroot, ghOpts)

  if(ghOpts) fs.writeFile = passThroughWrite(fs, litroot, ghOpts);
  return fs
};
