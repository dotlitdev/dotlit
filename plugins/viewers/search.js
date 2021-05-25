export const viewer = ({ node, React }) => {
  const { useState } = React;
  const meta = node?.properties?.meta || {};

  const [results, setResults] = useState(null);

  const search = async (src) => {
    const t = Date.now();

    const { default: Fuse } = await import(
      "https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.esm.js"
    );
    const manifest = meta.manifest
      ? await fetch("/manifest.json").then((res) => res.json())
      : {};
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
    const fullLocal = await (async (fn) => {
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
              if (
                key === ".git" ||
                !key ||
                pathname.endsWith(lit.location.src)
              ) {
              } else if (stat.type === "dir") await visit(pathname);
              else if (pathname.endsWith(".lit")) {
                contents = await lit.fs.readFile(pathname, {
                  encoding: "utf8",
                  localOnly: true,
                }); //.slice(0,10);
                contents.split("\n").map((line, index) =>
                  all.push({
                    pathname,
                    type: "line",
                    contents: line,
                    lineNo: index,
                  })
                );
              }
              const item = { pathname, type: stat.type, contents: pathname };
              all.push(item);
              return item;
            })
          );
        } catch (err) {
          alert(err.message);
        }
      };

      await visit(meta.ns || "/");
      return all;
    })();

    // return fullLocal

    const fuse = new Fuse(fullLocal, {
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true,
      ignoreFieldNorm: true,
      minMatchCharLength: 4,
      useExtendedSearch: true,
      keys: ["contents"],
    });

    // 3. Now search!
    const query = src.trim();
    const msg = (
      <div>
        Results for <span>{query}</span>. In{" "}
        <span>{(Date.now() - t) / 1000}</span> seconds.
      </div>
    );
    const res = fuse
      .search(query, { limit: 10 })
      //.map(x=>x.matches.map(x=>x.indices))
      .map((x) => [
        x.score,
        x.item.pathname,
        x.refIndex,
        x.matches,
        x.item.type,
        x.item.lineNo,
        x.item.contents,
      ]);
    setResults({ msg, results: res });
  };

  return (
    <div>
      <input onChange={(ev) => search(ev.target.value, meta)} />
      <div>{results && results.msg}</div>
      <div>
        {results &&
          results.results.map((res) => {
            const [score, pathname, index, matches, type, lineNo, val] = res;
            return (
              <div>
                <div>{pathname}</div>
                <span>{(1 - score) * 100}</span>{" "}
                <span>
                  {false &&
                    matches.map(({ indices, value }) =>
                      highlight(value, indices)
                    )}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};
