import diff from "https://cdn.skypack.dev/react-diff-viewer";
export const viewer = ({ node, React }) => {
  const rc = React.createElement;
  const { useState, useEffect } = React;
  const meta = node.properties && node.properties.meta;
  const [content, setContent] = useState("Loading...");
  const src = node.data.value;
  useEffect(async () => {
    const styles = {
      lineNumber: {
        fontWeight: "bold",
      },
      gutter: {
        minWidth: "0.6em",
        padding: "0 0.2em",
      },
      marker: {
        width: "auto",
        padding: "0 0.2em",
      },
      contentText: {
        lineHeight: "1em !important",
        wordBreak: "break-all",
      },
      content: {
        width: "auto",
        padding: 0,
      },
    };
    const stats = lit.fs.readStat(src);
    if (stats.local.value === stats.remote.value) {
      setContent("Local and Remote match. (No Diff)");
      return;
    }

    const view = rc(diff, {
      newValue: stats.local.value,
      rightTitle: "local",
      oldValue: stats.remote.value,
      leftTitle: "remote",
      splitView: meta && meta.split === "true",
      styles,
      compareMethod:
        diff[(meta && meta.method && meta.method.toUpperCase()) || "CHARS"],
    });

    setContent(view);
  }, [src]);

  return rc(
    "div",
    {
      className: "custom-diff-view",
    },
    content
  );
};
