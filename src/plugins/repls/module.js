export const repl = async (src, meta) => {
  const { btoa } = lit.utils.safeEncoders;
  const { transform } = lit.utils;
  const filename = (meta && meta.filename) || "untitled.js";
  let babel;
  try {
    babel = transform(filename, src);

    const s = `/*${Date.now()}*/` + babel.code;
    const console = "fake me";
    const m = await import(`data:text/javascript;base64,${btoa(s)}`);
    if (typeof m.default === "function") {
      const res = await m.default.call({ console });
      return lit.utils.inspect(res);
    } else return lit.utils.inspect(m);
  } catch (err) {
    return err.message;
  }
};
