if (typeof lit !== "undefined" && !window.__runkitCORSProxyEnpoint) {
  (async (fn) => {
    const rkEmbed = document.createElement("script");
    rkEmbed.onload = (fn) => alert("loaded");
    rkEmbed.setAttribute("src", "https://embed.runkit.com");
    document.body.appendChild(el);
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.setAttribute("style", "height:0;");
    RunKit.createNotebook({
      element: el,
      mode: "endpoint",
      onLoad: async (rk) => {
        window.__runkitCORSProxyEnpoint = await rk.getEndpointURL();
        document.body.removeChild(el);
      },
      evaluateOnLoad: true,
      source: await lit.fs.readFile("/testing/runkit-repl-endpoint.js", {
        encoding: "utf8",
      }),
    });
  })();
}

export const proxy = async (src, meta, node) => {
  if (!window.__runkitCORSProxyEnpoint) {
    return "Still setting up proxy endpoint";
  } else {
    return window.__runkitCORSProxyEnpoint;
  }
};
