import React, { useState } from "react";

// A single full-width accordion row listing every *satisfied* item compactly — used so the
// grid above only needs to surface the failing/unsatisfied claims as individual boxes.
const SatisfiedAccordion = ({ label, items, renderItem, logo }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="rounded px-4 py-3 satisfied-accordion-header"
      style={{
        gridColumn: "1 / -1",
        color: "#343a40",
        cursor: "pointer",
      }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="d-flex align-items-center justify-content-between">
        <span className="fw-bold d-flex align-items-center gap-2">
          {logo && (
            <img
              src={logo}
              alt=""
              style={{ width: "1.5rem", height: "auto" }}
            />
          )}
          {label} ({items.length})
        </span>
        <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </div>
      {expanded && (
        <div className="mt-3 satisfied-accordion-grid">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded d-flex align-items-start gap-2"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success flex-shrink-0"
                style={{ width: "1.4rem", height: "1.4rem" }}
              >
                <i
                  className="bi bi-check-lg text-white"
                  style={{ fontSize: "0.75rem" }}
                />
              </span>
              <div>{renderItem(item)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SatisfiedAccordion;
