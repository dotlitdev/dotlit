if (typeof lit !== "undefined" && !window.__runkitCORSProxyEnpoint) {
  (async (fn) => {
    const rkEmbed = document.createElement("script");
    rkEmbed.onload = async (fn) => {
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
        source: await lit.fs.readFile("/testing/runkit-express-cors-proxy.js", {
          encoding: "utf8",
        }),
      });
    };
    rkEmbed.setAttribute("src", "https://embed.runkit.com");
    document.body.appendChild(rkEmbed);
  })();
}

export const proxy = async (src, meta, node) => {
  if (!window.__runkitCORSProxyEnpoint) {
    return "Still setting up proxy endpoint";
  } else {
    const getAndReplaceDomain = (originalUrl, newDomain) => {
      return newDomain + originalUrl.replace(/^https?:\/\//, "/");
    };

    const proxyFetch = async (url, opts = {}) => {
      const proxyUrl = getAndReplaceDomain(
        url,
        window.__runkitCORSProxyEnpoint
      );
      return fetch(proxyUrl, opts);
    };

    return proxyFetch;
  }
};
