import path from "path";

import { ghWriteFile } from "../utils/fs-promises-gh-utils.js";



export const extendFs = (fs) => {
  const rf = fs.readFile;

  fs.readFile = async (...args) => {
    try {
      return await rf(...args);
    } catch (err) {
      return await (await fetch(path.join(litroot, args[0]))).text();
    }
  };

  const wf = fs.writeFile;

  fs.writeFile = async (...args) => {
    const filepath = (args[0] = "/" + args[0]);
    const p = path.parse(filepath);
    const parts = p.dir.split(path.sep);
    console.log(`"Parts for "${filepath}"`, parts);
    for (var i = 0; i < parts.length; i++) {
        // console.log(`[${i}] <--- "${parts[i]}"`);
        if (i === 0) {
        } else {
        const subPath = parts.slice(0, i + 1).join(path.sep);
        // console.log(`"${subPath}" Sub path`);
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
  }

  const wfp = fs.writeFile

  const ghToken = localStorage.getItem("ghToken");

  if (ghToken) {
    fs.writeFile = async (...args) => {
        await wfp(...args);
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

};
