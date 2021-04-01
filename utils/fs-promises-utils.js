import path from "path";
import { ghWriteFile } from "../utils/fs-promises-gh-utils";
import { getConsoleForNamespace } from './console'

const console = getConsoleForNamespace('fs')

const passThroughRead = (fs) => {
  const rf = fs.readFile
  return async (...args) => {
    console.log('fs.passThroughRead')
    try {
      return await rf(...args);
    } catch (err) {
      console.log('fs.passThroughRead passing through to fetch')
      return await (await fetch(path.join(litroot, args[0]))).text();
    }
  };
}

const writeFileP = (fs) => {
  const wf = fs.writeFile
  return async (...args) => {
    console.log("fs.writeFileP")
    const filepath = (args[0] = "/" + args[0]);
    const p = path.parse(filepath);
    const parts = p.dir.split(path.sep);
    console.log(`"Parts for "${filepath}"`, parts);
    for (var i = 0; i < parts.length; i++) {
      console.log(`[${i}] <--- "${parts[i]}"`);
      if (i === 0) {
      } else {
        const subPath = parts.slice(0, i + 1).join(path.sep);
        console.log(`"${subPath}" Sub path`);
        try {
          await fs.stat(subPath);
          console.log(`"${subPath}" Existed, skipping`);
        } catch (err) {
          console.log(`"${subPath}" Didn't exist, creating...`);
          await fs.mkdir(subPath);
        }
      }
    }
    console.log("Writing file", ...args);
    return wf(...args);
  };
}

const passThroughWrite = (fs) => {
  const wf = fs.writeFile
  return async (...args) => {
    console.log('fs.passThroughWrite')
    await wf(...args);
    const ghwf = ghWriteFile({
      username: "dotlitdev",
      repository: "dotlit",
      prefix: "/src",
      token: ghToken,
    });
    try {
      const ghResp = await ghwf(...args);
      console.log("GitHub write resp", ghResp);
    } catch (err) {
      console.error("GitHub write threw", err);
    }
  };
}

export const extendFs = (fs) => {
  fs.readFile = passThroughRead(fs);
  fs.writeFile = writeFileP(fs);

  const ghToken = localStorage.getItem("ghToken");
  if (ghToken) fs.writeFile = passThroughWrite(fs);
  return fs
};
