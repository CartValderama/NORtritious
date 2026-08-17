import React from "react";

// Small pill badge pushed to the right edge of an Accordion.Header (pairs
// with the chevron via CSS — see .result-accordion-toggle::after in
// Calculator.css). Colors are passed in via `style`, not baked in here.
const AccordionBadge = ({ style, children }) => (
  <span
    className="badge rounded-pill ms-auto"
    style={{ fontWeight: 500, padding: "0.45em 0.85em", ...style }}
  >
    {children}
  </span>
);

export default AccordionBadge;
