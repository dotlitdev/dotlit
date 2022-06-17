export const viewer = ({ node, React }) => {
  const { useEffect, useState } = React;
  const [output, setOutput] = useState("Loading...");
  useEffect(() => {
    setOutput(JSON.stringify(node, null, 2));
  }, [node]);
  return React.createElement("pre", { style: { color: "black" } }, output);
};
