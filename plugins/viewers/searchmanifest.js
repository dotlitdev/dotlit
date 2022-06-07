
const sortBy = (keys) => (a, b) => {
  for (const key of keys) {
    if (a[key] !== b[key]) break;
    else return a[key] > b[key] ? 1 : -1;
  }
};

const itemBuilder = (React) => (item) => {
  const rc = React.createElement;
  return rc(
    "li",
    { className: "item" },
    rc(
      "a",
      { href: lit.href || lit.location.root + item.id },
      item.title || item.id
    )
  );
};

export const viewer = ({ node, React }) => {
  const rc = React.createElement;
  const { useState, useEffect } = React;
  const meta = node.properties && node.properties.meta;
  const [src, setSrc] = useState(meta.search || node.data.value.trim());
  const [content, setContent] = useState("Loading...");
  const item = itemBuilder(React);

  useEffect(async () => {
    const resp = await fetch("/manifest.json");
    const json = await resp.json();
    let regex;
    try {
      regex = new RegExp(src, "i");
    } catch (err) {}
    const res = json.nodes
      .map((x) => x)
      .filter((x) => {
        return (
          x.id.indexOf(src) >= 0 ||
          (regex && regex.test(x.id)) ||
          (x.title &&
            (x.title.indexOf(src) >= 0 || (regex && regex.test(x.title))))
        );
      })
      .sort()
      .map((x) => item(x));
    //.join("\n")
    setContent(rc("ol", null, res));
  }, [src]);

  return rc(
    "div",
    {
      className: "custom-react-view",
    },
    [
      rc("input", {
        style: { width: "100%", fontSize: "1.2em" },
        value: src,
        onChange: (e) => setSrc(e.target.value),
      }),
      content,
    ]
  );
};
