import React from "react";

// A single collapsible stat/claim row — header (icon + bold title [+ stat]) always visible,
// detail text collapses behind a click so a long list of boxes doesn't read as a wall of text.
// statLineInBody: statLine renders under the description instead of in the header — opt-in
// so existing callers (e.g. NokkelhulletSection) keep the stat in the header unchanged.
// bgClassName: overrides the default light-gray background with a Bootstrap subtle-color
// class — opt-in so only callers that want a distinct color (e.g. HealthClaimsSection) pass it.
// badgeClassName: same idea for the icon-circle badge — defaults to green/red (success/danger).
const StatBox = ({
  passed,
  title,
  statLine,
  statLineInBody,
  bgClassName,
  badgeClassName,
  children,
}) => {
  const color = "#343a40";
  const bg = "#fafafa";

  return (
    <div
      className={`rounded p-4 d-flex flex-column ${bgClassName || ""}`}
      style={{ backgroundColor: bgClassName ? undefined : bg, color }}
    >
      <div className="d-flex align-items-start gap-2">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${badgeClassName || (passed ? "bg-success" : "bg-danger")}`}
          style={{ width: "1.75rem", height: "1.75rem" }}
        >
          <i
            className={`bi ${passed ? "bi-check-lg" : "bi-x-lg"} text-white`}
            style={{ fontSize: "0.9rem" }}
          />
        </span>
        <div>
          <span className="fw-bold">{title}</span>
          {statLine && !statLineInBody && (
            <>
              : <strong>{statLine}</strong>
            </>
          )}
        </div>
      </div>
      <div className="mt-2">
        {statLine && statLineInBody ? (
          <>
            {statLine}. {children}
          </>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default StatBox;
