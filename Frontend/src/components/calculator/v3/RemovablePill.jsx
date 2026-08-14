import React from "react";

// A committed "Kilde til Annet" entry (Stivelse or one of otherSubstances) —
// same rounded-pill shell with a red remove button either way.
const RemovablePill = ({ label, onRemove, ariaLabel }) => (
  <div className="d-flex align-items-stretch rounded-pill overflow-hidden">
    <span
      className="d-flex align-items-center px-3 py-1"
      style={{ backgroundColor: "#f1f1f1", color: "#333", fontSize: "0.85rem" }}
    >
      {label}
    </span>
    <button
      type="button"
      className="d-flex align-items-center justify-content-center border-0 px-3"
      style={{ backgroundColor: "#dc3545", color: "#fff" }}
      onClick={onRemove}
      aria-label={ariaLabel}
    >
      <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }} />
    </button>
  </div>
);

export default RemovablePill;
