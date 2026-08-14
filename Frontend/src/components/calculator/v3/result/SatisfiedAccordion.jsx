import React, { useState } from "react";

// A single full-width accordion row listing items compactly, collapsed by default.
// `passed` controls the header icon and subtle background (green check vs red x) —
// defaults to true, though every current caller passes false (unsatisfied claims only).
// `icon` is the Nøkkelhullet/EFSA logo of the section this accordion belongs to,
// shown with a red slash overlay to signal "not fulfilled" at a glance.
const SatisfiedAccordion = ({ label, items, renderItem, passed = true, icon }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className={`rounded ${passed ? "bg-success-subtle" : ""}`}
      style={{
        gridColumn: "1 / -1",
        backgroundColor: passed ? undefined : "#fafafa",
      }}
    >
      <button
        type="button"
        className="btn satisfied-accordion-toggle w-100 py-3 px-4 border-0 bg-transparent d-flex align-items-center justify-content-between"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="d-flex align-items-center gap-2">
          {icon && (
            <span
              className="position-relative d-inline-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "1.6rem", height: "1.6rem" }}
            >
              <img
                src={icon}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              {/* Hand-built "no entry" ring instead of an icon glyph, so the
                  diagonal line reaches exactly edge-to-edge every time. */}
              <span
                className="position-absolute rounded-circle"
                style={{ inset: "-1px", border: "3px solid #dc3545" }}
              />
              <span
                className="position-absolute"
                style={{
                  top: "50%",
                  left: "-1px",
                  right: "-1px",
                  height: "3px",
                  backgroundColor: "#dc3545",
                  transform: "translateY(-50%) rotate(45deg)",
                }}
              />
            </span>
          )}
          {label} ({items.length})
        </span>
        <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </button>
      {expanded && (
        <div className="mt-1 pb-3 px-4 satisfied-accordion-grid">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SatisfiedAccordion;
