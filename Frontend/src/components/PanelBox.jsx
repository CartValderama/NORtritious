import React from "react";

// General-purpose light-grey/white rounded card — same background/shadow
// everywhere, just with a different bg color and extra classes/styles per
// caller.
const PanelBox = ({
  children,
  className = "",
  style,
  bg = "#fff",
  rounded = true,
  border = true,
}) => (
  <div
    className={`${rounded ? "rounded-4 " : ""} px-4 ${className}`}
    style={{
      backgroundColor: bg,
      paddingTop: "1.75rem",
      paddingBottom: "2rem",
      ...(border ? { boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)" } : {}),
      ...style,
    }}
  >
    {children}
  </div>
);

export default PanelBox;
