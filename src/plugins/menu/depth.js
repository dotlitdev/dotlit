export const sectionmenu = (ctx, { React, Menu }) => {
  const rc = React.createElement;
  const { visit } = lit.utils.unist;

  const update = () => ctx.setSrc(lit.ast.position, ctx.ast2md(lit.ast));

  const withPos = (tree, pos, visitor) =>
    visit(
      lit.ast,
      () => true,
      (node) => {
        if (node?.position?.start?.offset === pos.start?.offset) {
          console.log("found match: ", node.type);
          visitor(node);
          return visit.SKIP;
        }
      }
    );

  const push = () =>
    withPos(lit.ast, ctx.selectedCell, (node) => {
      visit(node, "heading", (node) => (node.depth += 1));
      update();
    });

  const pull = () =>
    withPos(lit.ast, ctx.selectedCell, (node) => {
      visit(node, "heading", (node) => (node.depth -= 1));
      update();
    });

  const Push = rc("span", { onClick: push }, "Push");

  const Pull = rc("span", { onClick: pull }, "Pull");

  return rc(
    Menu,
    {
      title: "Depth",
      disabled: !ctx.selectedCell,
    },
    [Push, Pull]
  );
};
