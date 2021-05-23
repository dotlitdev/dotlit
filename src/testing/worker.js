// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } };
postMessage("Version: 2");
postMessage("Location: " + typeof location + JSON.stringify(location));
importScripts("../web.bundle.js");
postMessage("dotlit: " + typeof dotlit);
postMessage("lit" + JSON.stringify(dotlit.lit.location));

const getFsTest = async (filepath) => {
  postMessage(`Getting ${filepath} from local fs.`);
  try {
    const path = lit.utils.path;
    const visit = async (root) => {
      const list = await lit.fs.readdir(root);
      return Promise.all(
        list.map(async (key) => {
          const pathname = path.join(root, key);
          const stat = await lit.fs.stat(pathname);
          let contents;
          if (key === ".git") {
            return { pathname, type: stat.type };
          } else if (stat.type === "dir") contents = await visit(pathname);
          else
            contents =
              (
                await lit.fs.readFile(pathname, {
                  encoding: "utf8",
                  localOnly: true,
                })
              ).slice(0, 10) + "...";
          return { pathname, type: stat.type, contents };
        })
      );
    };

    return (async (fn) => {
      lit.fs.writeFile(
        "/testing/full.json",
        JSON.stringify(await visit("/"), null, 2)
      );
    })();
  } catch (err) {
    postMessage("error:" + err.toString());
    postMessage("done");
  }
};

getFsTest("/index.lit");
