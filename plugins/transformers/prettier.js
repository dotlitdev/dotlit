export const transformer = async ({
  node,
  src,
  codeSource,
  rawSource,
  originalSource,
}) => {
  const lines = src.split("\n");
  let [first, ...rest] = lines;
  let middle = rest.slice(0, -1);
  const [last] = rest.slice(-1);
  const body = middle.join("\n");

  const p = await import("https://unpkg.com/prettier@2.3.0/esm/standalone.mjs");
  const b = await import(
    "https://unpkg.com/prettier@2.3.0/esm/parser-babel.mjs"
  );

  const format = p.default.format;
  const babelPlugin = b.default;
  try {
    const result = format(body, { parser: "babel", plugins: [babelPlugin] });
    if (body !== result) {
      console.log("prettier transformed source", { body, result });
    }
    return [first, result, last].join("\n");
  } catch (err) {
    console.error(err);
    lit.file.message(err.message);
    return src;
  }
};
