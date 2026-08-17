import React from "react";

// Small chip showing a label plus an "x" to remove it — used for each added
// EFSA Kilde til Annet substance (Stivelse, Tilsatt sukker, etc.).
const RemovablePill = ({ label, onRemove, ariaLabel }) => (
  <span className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 bg-light border">
    {label}
    <button
      type="button"
      className="btn-close"
      style={{ fontSize: "0.65rem" }}
      onClick={onRemove}
      aria-label={ariaLabel}
    />
  </span>
);

export default RemovablePill;
