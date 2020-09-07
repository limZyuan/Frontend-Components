import React from "react";

const AlignPlugin = () => ({
  renderNode(nodeProps) {
    const { attributes, children, node } = nodeProps;
    const align = node.data.get("align");
    if (align) {
      if (node.type === "heading-one" || node.type === "heading-two") {
        return (
          <div
            {...attributes}
            className={[`align_${align}`, `${node.type}`].join(" ")}
          >
            {children}
          </div>
        );
      } else {
        return (
          <div {...attributes} className={`align_${align}`}>
            {children}
          </div>
        );
      }
    }
    return null;
  }
});

export default AlignPlugin;
