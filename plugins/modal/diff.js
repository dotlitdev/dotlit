import diff from "https://cdn.skypack.dev/react-diff-viewer";

export const filemenu = (ctx, { React, Menu, toggleModal }) => {
  const rc = React.createElement;

  const showDiff = async () => {
    const close = rc("button", { onClick: () => toggleModal() }, ["Close"]);

    const styles = {
      lineNumber: {
        fontWeight: "bold",
      },
      gutter: {
        minWidth: "0.6em",
        padding: "0 0.2em",
      },
      marker: {
        width: "auto",
        padding: "0 0.2em",
      },
      contentText: {
        lineHeight: "1em !important",
        wordBreak: "break-all",
      },
      content: {
        width: "auto",
        padding: 0,
      },
    };
    const stats = await lit.fs.readStat(lit.location.src, { encoding: "utf8" });
    if (stats.local.value === stats.remote.value) {
      toggleModal(rc("div", {}, [close, "Local and Remote match. (No Diff)"]));
      return;
    }

    const view = rc(diff, {
      newValue: stats.local.value,
      rightTitle: "local",
      oldValue: stats.remote.value,
      leftTitle: "remote",
      splitView: false,
      styles,
      compareMethod: diff["CHARS"],
    });

    const modal = rc("div", {}, [close, view]);
    toggleModal(modal);
  };

  return rc("span", { onClick: showDiff }, "Show Diff");
};
