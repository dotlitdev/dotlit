// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } };

postMessage("Version: 0.0.6");
postMessage("Location: " + typeof location + JSON.stringify(location));
importScripts("../web.bundle.js");
postMessage("dotlit: " + typeof dotlit);
postMessage("lit" + JSON.stringify(dotlit.lit.location));

const getFsTest = async (filepath) => {
  postMessage(`Getting ${filepath} from local fs.`);
  try {
    const path = dotlit.lit.utils.path;
    const all = [];
    const visit = async (root) => {
      let p;
      try {
        const list = await dotlit.lit.fs.readdir(root);
        p = Promise.all(
          list.map(async (key) => {
            const pathname = path.join(root, key);
            const stat = await dotlit.lit.fs.stat(pathname);
            let contents;
            if (key === ".git" || !key) {
              return { pathname, type: stat.type };
            } else if (stat.type === "dir") contents = await visit(pathname);
            else
              contents = await dotlit.lit.fs.readFile(pathname, {
                encoding: "utf8",
                localOnly: true,
              });
            postMessage("file: " + pathname);
            const item = { pathname, type: stat.type, contents };
            all.push(item);
            return item;
          })
        );
      } catch (err) {
        postMessage("err: " + err.message);
      }
      return p;
    };

    await visit(filepath);
    postMessage("done");
  } catch (err) {
    postMessage("error:" + err.toString());
    postMessage("done");
  }
};

getFsTest("/");
