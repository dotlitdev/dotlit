export const repl = async (src, meta) => {
  const { btoa } = lit.utils.safeEncoders;
  const { transform } = lit.utils;
  const filename = (meta && meta.filename) || "untitled.js";
  let babel;
  try {
    babel = transform(filename, src);

    // So many hacks due to blob and/or data uri
    // - cachbusting comment
    // - rewrite imports urls to be absolute
    const s =
      `/*${Date.now()}*/` +
      babel.code.replace(
        /HORRIBLE_HACK/g,
        location.href
        // new URL("..", location.href).toString()
      );
    const console = "fake me";
    // const url = `data:text/javascript;base64,${btoa(s)}`
    const url = URL.createObjectURL(new Blob([s], { type: "text/javascript" }));
    const m = await import(url + "#location=" + location.href);
    if (typeof m.default === "function") {
      const res = await m.default.call({ console });
      return lit.utils.inspect(res);
    } else return lit.utils.inspect(m);
  } catch (err) {
    return err.message;
  }
};
