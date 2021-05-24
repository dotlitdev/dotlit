
inpory Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.esm.js'
export const viewer = ({ node, React }) => {
  const t = Date.now();
  // const manifest = await fetch("/manifest.json").then((res) => res.json());

  // Recursively builds JSX output adding `<mark>` tags around matches
  const highlight = (value, indices = [], i = 1) => {
    const pair = indices[indices.length - i];
    return !pair ? (
      value
    ) : (
      <>
        {highlight(value.substring(0, pair[0]), indices, i + 1)}
        <mark>{value.substring(pair[0], pair[1] + 1)}</mark>
        {value.substring(pair[1] + 1)}
      </>
    );
  };

  const fullLocal = await(async (fn) => {
    const path = lit.utils.path;
    const all = [];
    const visit = async (root) => {
      try {
        const list = await lit.fs.readdir(root);
        return Promise.all(
          list.map(async (key) => {
            const pathname = path.join(root, key);
            const stat = await lit.fs.stat(pathname);
            let contents;
            if (key === ".git" || !key) {
            } else if (stat.type === "dir") await visit(pathname);
            else if (pathname.endsWith(".lit"))
              contents = await lit.fs.readFile(pathname, {
                encoding: "utf8",
                localOnly: true,
              }); //.slice(0,10);
            const item = { pathname, type: stat.type, contents };
            all.push(item);
            return item;
          })
        );
      } catch (err) {
        alert(err.message);
      }
    };

    await visit("/");
    return all;
  })();

  // return fullLocal

  const fuse = new Fuse(fullLocal, {
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    ignoreFieldNorm: true,
    minMatchCharLength: 4,
    keys: ["pathname", "contents"],
  });

  // 3. Now search!
  const query = node.data.value.trim();
  const msg = `Results for search "**${query}**". In **${
    (Date.now() - t) / 1000
  }** seconds.\n\n`;

  return (
    <div>
      <span>{msg}</span>
    </div>
  );
};
