const fs = require("fs").promises
const path = require("path")

export async function copyRecursive(src, dest) {
  var stats = await fs.stat(src);
  var isDirectory = stats.isDirectory();
  if (isDirectory) {
    try {
        await fs.mkdir(dest);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    const files = await fs.readdir(src)
    await Promise.all( files.map(async function(childItemName) {
      await copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    }))
  } else {
    await fs.copyFile(src, dest);
  }
};