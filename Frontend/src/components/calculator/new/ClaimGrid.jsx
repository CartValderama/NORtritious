import React from "react";

const ClaimGrid = ({ isEmpty, emptyMessage, children, className = "" }) => (
  <div className={`rounded result-grid gap-0 ${className}`.trim()}>
    {isEmpty ? <p className="mb-0 p-4">{emptyMessage}</p> : children}
  </div>
);

export default ClaimGrid;
