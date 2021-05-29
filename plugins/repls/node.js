if (typeof lit !== "undefined" && !window.__runkitNodeEnpoint) {
  (async (fn) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.setAttribute("style", "height:0;");
    RunKit.createNotebook({
      element: el,
      mode: "endpoint",
      onLoad: async (rk) => {
        window.__runkitNodeEnpoint = await rk.getEndpointURL();
        document.body.removeChild(el);
      },
      evaluateOnLoad: true,
      source: await lit.fs.readFile("/testing/runkit-repl-endpoint.js", {
        encoding: "utf8",
      }),
    });
  })();
}

export const repl = async (src, meta, node) => {
  if (!window.__runkitNodeEnpoint) {
    return "Still setting up repl endpoint";
  } else {
    try {
      return await (
        await fetch(window.__runkitNodeEnpoint, {
          method: "POST",
          body: JSON.stringify({ src, meta }),
        })
      ).text();
    } catch (err) {
      return err.message;
    }
  }
};
