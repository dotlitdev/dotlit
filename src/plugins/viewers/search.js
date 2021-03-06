export const viewer = ({ node, React }) => {
  const { useState } = React;
  const meta = node?.properties?.meta || {};

  const [results, setResults] = useState(null);
  // Recursively builds JSX output adding `<mark>` tags around matches
  const highlight = (value, indices = [], i = 1) => {
    try {
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
    } catch (err) {
      return err.message;
    }
  };
  const search = async (src) => {
    const t = Date.now();

    const { default: Fuse } = await import(
      "https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.esm.js"
    );
    const manifest = meta.manifest
      ? await fetch("/manifest.json").then((res) => res.json())
      : {};

    const fullLocal = await (async (fn) => {
      const path = lit.utils.path;
      const all = [];
      const visit = async (root) => {
        try {
          const list = await lit.fs.readdir(root);
          return Promise.all(
            list.map(async (key) => {
              const pathname = path.join(root, key);
              const stat = await lit.fs.stat(pathname).catch((e) => {});
              let contents;
              if (
                !stat ||
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
              const item = { pathname, type: stat?.type, contents: pathname };
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
      minMatchCharLength: 3,
      useExtendedSearch: true,
      threshol: 0.3,
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
    console.log(msg, res);
    setResults({ msg, results: res });
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    fontSize: "1em",
  };

  return (
    <div>
      <input
        style={inputStyle}
        placeholder={`Search (local ${meta.ns || "/"}) file system`}
        onChange={(ev) => search(ev.target.value, meta)}
      />
      <div>{results && results.msg}</div>
      <div>
        {results &&
          results.results.map((res) => {
            const [score, pathname, index, matches, type, lineNo, val] = res;
            const href = pathname.replace(
              /.(lit|md)$/,
              ".html?file=" + pathname
            );
            return (
              <div style={{ marginBottom: "0.6em" }}>
                <div>
                  <a href={href}>
                    <strong>{pathname}</strong>
                  </a>{" "}
                  type: <span>{type}</span> score:{" "}
                  <span>{(1 - score) * 100}</span>
                </div>
                <blockquote>{highlight(val, matches[0].indices)}</blockquote>
              </div>
            );
          })}
      </div>
    </div>
  );
};
