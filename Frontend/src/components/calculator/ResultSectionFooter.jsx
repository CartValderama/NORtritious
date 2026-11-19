import React from "react";
import Pagination from "./Pagination";
import RegulationSourceLink from "./RegulationSourceLink";

// The single row under a result section's cards. The link to the regulation sits on the
// left of it and the pager on the right.
//
// One row rather than two stacked ones, because neither belongs to any card in particular.
// Both are about the section as a whole, and giving them a border and a row each left a
// band of empty space between the last card and the next section.
//
// Draws nothing when a section has neither, so a section hands over what it has and does
// not have to work out whether a footer is warranted.
const ResultSectionFooter = ({ source, pager, pagerLabel }) => {
  // The same test Pagination makes on itself. Asked here as well, because a footer with a
  // one-page pager and no link would otherwise be an empty bordered strip.
  const hasPages = Boolean(pager) && pager.pageCount > 1;
  if (!source && !hasPages) return null;

  return (
    <div className="border-top px-4 py-3 d-flex flex-wrap align-items-center gap-3">
      {source && <RegulationSourceLink source={source} />}
      {/* ms-auto rather than justify-content-between on the row, so the pager sits right
          whether or not there is a link to the left of it. */}
      {hasPages && <Pagination {...pager} label={pagerLabel} className="ms-auto" />}
    </div>
  );
};

export default ResultSectionFooter;
