import React from "react";

// A single collapsible stat/claim row — header (icon + bold title + stat) always visible,
// detail text collapses behind a click so a long list of boxes doesn't read as a wall of text.
const StatBox = ({ passed, title, statLine, children }) => {
  const color = passed ? "#0f5132" : "#343a40";
  const bg = passed ? "#f0faf1" : "#fafafa";

  return (
    <div
      className="rounded p-4 d-flex flex-column"
      style={{ backgroundColor: bg, color }}
    >
      <div className="d-flex align-items-start gap-2">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${passed ? "bg-success" : "bg-danger"}`}
          style={{ width: "1.75rem", height: "1.75rem" }}
        >
          <i
            className={`bi ${passed ? "bi-check-lg" : "bi-x-lg"} text-white`}
            style={{ fontSize: "0.9rem" }}
          />
        </span>
        <div>
          <span className="fw-bold">{title}</span>
          {statLine && (
            <>
              : <strong>{statLine}</strong>
            </>
          )}
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

export default StatBox;
