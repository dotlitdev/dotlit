const setup = new Promise((resolve, reject) => {
  if (typeof lit !== "undefined") reject("No lit");
  else if (!window.__runkitCORSProxyEnpoint) {
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
            const endpoint = await rk.getEndpointURL();
            window.__runkitCORSProxyEnpoint = endpoint;
            document.body.removeChild(el);
          },
          evaluateOnLoad: true,
          source: await lit.fs.readFile(
            "/testing/runkit-express-cors-proxy.js",
            {
              encoding: "utf8",
            }
          ),
        });
      };
      rkEmbed.setAttribute("src", "https://embed.runkit.com");
      document.body.appendChild(rkEmbed);
    })();
  } else {
    resolve(window.__runkitCORSProxyEnpoint);
  }
});

export const proxy = async (returnEndpoint) => {
  if (!window.__runkitCORSProxyEnpoint) {
    return "Still setting up proxy endpoint";
  } else {
    const endpoint = await setup();
    if (returnEndpoint) return endpoint;

    const getAndReplaceDomain = (originalUrl, newDomain) => {
      return newDomain + originalUrl.replace(/^https?:\/\//, "/");
    };

    const proxyFetch = async (url, opts = {}) => {
      const proxyUrl = getAndReplaceDomain(url, endpoint);
      return fetch(proxyUrl, opts);
    };

    return proxyFetch;
  }
};
