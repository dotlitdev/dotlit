import path from "path";
import { ghWriteFile, ghReadFile, ghDeleteFile } from "../utils/fs-promises-gh-utils";
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

const passThroughReadWithStat = (origReadFile, origStat, litroot, ghOpts, noPassthrough) => {

  return async (...args) => {
    console.log('fs.passThroughReadWithStat', litroot, args[0])

    const resp = {
      local: { stat: undefined, value: undefined },
      remote: { stat: undefined, value: undefined },
    }
    const filePath = args[0] = path.join(litroot, args[0])
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

    

    let remoteResp
    if (ghOpts) {
        console.log("fs.passThroughtReadWithStat passing through to GitHub", filePath)
        const ghrf = ghReadFile(ghOpts)
        try {
             remoteResp = await ghrf(filePath)
        } catch(err){
             console.log("fs.passThroughtReadWithStat GitHub read failed", err) 
        }
    } else if (noPassthrough) {
      return resp
    } else {
        console.log('fs.passThroughReadWithStat passing through to fetch', filePath)
        remoteResp = await fetch(filePath)
    }

    if (!remoteResp || remoteResp.status < 200 || remoteResp.status >= 400) {
      if (!resp.local.stat && !resp.local.value) {
        console.log('fs.passThroughReadWithStat failed local and remote read')
        throw new Error(`${remoteResp?.status || "Request"} Error. Fetching File.`)
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
    console.log("fs.writeFileP ", args[0])
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
          await fs.mkdir(subPath);
        } catch (err) {
          // console.log(`[fs.writeFileP] "${subPath}" Failed to mkdirpath `);
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
    if (ghOpts && !(args[2] && args[2].localOnly)) {
      const ghwf = ghWriteFile(ghOpts);
      try {
        const ghResp = await ghwf(...args);
        console.log("GitHub write resp", ghResp);
      } catch (err) {
        console.error("GitHub write threw", err);
      }
    }
  };
}

const passThroughUnlink = (fs,litroot, ghOpts) => {
  const uf = fs.unlink
  return async (filepath, localOnly) => {
    console.log('fs.passThroughUnlink')
    let local
    try {
        local = await uf(filepath, localOnly)
    } catch (err) {
        console.log("fs.passThroughUnlink didn't unlink local file", err)
    }
    if (localOnly) return local;
    if (ghOpts) {
      const ghdf = ghDeleteFile(ghOpts);
      let ghResp
      try {
        ghResp = await ghdf(filepath.slice(1));
        console.log("GitHub delete resp", ghResp);
      } catch (err) {
        console.error("GitHub delete threw", err.message, err);
      }
      return ghResp
    } else {
      return local
    }
  };
}

export const extendFs = (fs, litroot = "", ghOpts, noPassthrough) => {
  const clonedfs = {...fs}
  const origReadFile = clonedfs.readFile
  const origStat = clonedfs.stat
  
  
  if (!noPassthrough) clonedfs.readFile = passThroughRead(origReadFile,litroot);
  clonedfs.writeFile = writeFileP(clonedfs, litroot);
  clonedfs.readStat = passThroughReadWithStat(clonedfs.readFile, origStat, litroot, ghOpts, noPassthrough)

  if(ghOpts) clonedfs.writeFile = passThroughWrite(clonedfs, litroot, ghOpts);
  if(ghOpts) clonedfs.unlink = passThroughUnlink(clonedfs, litroot, ghOpts);

  return clonedfs
};
