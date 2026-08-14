import React from "react";

// The light-grey/white rounded card used for every main section of the v3
// calculator (product info, nutrition form, empty-state placeholder, the
// "how to use" accordion item) — same background/border everywhere, just
// with a different bg color and extra classes/styles per caller.
const PanelBox = ({
  children,
  className = "",
  style,
  bg = "#fafafa",
  rounded = true,
  border = true,
}) => (
  <div
    className={`${rounded ? "rounded-4 " : ""}p-4 ${className}`}
    style={{
      backgroundColor: bg,
      ...(border ? { border: "1px solid #f2f2f2" } : {}),
      ...style,
    }}
  >
    {children}
  </div>
);

export default PanelBox;
