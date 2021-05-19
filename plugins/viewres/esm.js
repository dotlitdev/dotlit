export const viewer = ({ node, React }) => {
  const rce = React.createElement;
  const { useState, useEffect } = React;
  const [resp, setResp] = useState(null);
  const [run, setRun] = useState(0);

  const exec = (ev) => {
    ev && ev.stopPropagation();
    setRun(run + 1);
    load(node.data.value);
    return false;
  };

  useEffect((args) => {
    if (run === 0 && node.properties.meta.exec === "onload") exec();
  }, []);

  async function load(src) {
    const val = `//run: ${run}\n${src}`;
    const module = await import(`data:text/javascript;base64,${btoa(src)}`);
    if (typeof module.returns === "function")
      setResp(await module.returns(run));
    else if (module.returns) setResp(module.returns);
  }

  const btn = rce("button", { onClick: exec }, "Run " + run);
  const t = rce("div", null, [btn, resp]);
  return t;
};
if (typeof module !== "undefined") module.exports.viewer = viewer;
