import React from "react";

// Red -> orange -> yellow -> green as the fulfilled percentage climbs — same
// pass/fail color language as the rest of the result section (StatBox's
// green/red badges), just gradated instead of binary.
const colorForPercentage = (percentage) => {
  if (percentage >= 75) return "#198754"; // green — mostly/fully fulfilled
  if (percentage >= 50) return "#ffc107"; // yellow — more than half
  if (percentage >= 25) return "#fd7e14"; // orange — some progress
  return "#dc3545"; // red — little to none fulfilled
};

// Reusable circular ("donut") progress ring for showing "N of M fulfilled" as
// a percentage, color-coded by how far along it is instead of a flat single
// color. `label` overrides the default centered "NN%" text (e.g. to show
// "3/4" instead) — pass any node, or null to show nothing in the center.
//
// Sizing is fully relative: the SVG uses a fixed 0-100 viewBox and renders at
// width/height 100%, so it always fills whatever pixel size its parent gives
// it — the parent is responsible for having an actual size (e.g. a fixed
// width/height or aspect-ratio box). `strokeWidth` is in the same 0-100
// units, so it scales along with the ring instead of staying a flat pixel
// value.
const CircularProgress = ({
  percentage,
  strokeWidth = 16,
  label,
  trackColor = "#e9ecef",
  color: colorOverride,
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const viewBoxSize = 100;
  const radius = (viewBoxSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorOverride || colorForPercentage(clamped);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width="100%"
        height="100%"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
          }}
        />
      </svg>
      {label !== null && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ position: "absolute", inset: 0 }}
        >
          {label !== undefined ? (
            label
          ) : (
            <span className="fw-bold" style={{ color }}>
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
