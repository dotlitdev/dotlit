export const viewer = ({ node, React }) => {
  const { useEffect, useState } = React;
  const [output, setOutput] = useState("Loading...");
  useEffect(() => {
    setOutput(lit.utils.inspect(node));
  }, [node]);
  return React.createElement("pre", { style: { color: "black" } }, output);
};
