import React from "react";

// Links the regulation a result section's verdicts are drawn from. Sits on the left of the
// section's footer row, see ResultSectionFooter.
//
// One per section rather than one per card. Each card states what the product contains and
// whether a limit was cleared, but every limit in the section comes from the same document,
// so repeating the link on each card would add nothing to read.
//
// Wears the same grey chip as the links inside a helsepåstand card, so every link out of a
// result looks the same wherever it sits and none of them reads as a verdict.
const RegulationSourceLink = ({ source }) => (
  <a
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-light-secondary btn-sm text-start d-inline-flex align-items-center gap-2"
    style={{ textDecoration: "none", fontSize: "0.85rem" }}
  >
    <i className="bi bi-box-arrow-up-right" style={{ flexShrink: 0 }} />
    {source.label}
  </a>
);

export default RegulationSourceLink;
