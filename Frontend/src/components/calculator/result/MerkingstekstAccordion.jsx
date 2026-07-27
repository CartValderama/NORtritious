import React, { useState } from "react";

const MerkingstekstAccordion = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded mt-3"
      style={{ backgroundColor: "#e8f5e9", color: "#1a4731" }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fw-bold">
          <i className="bi bi-info-circle me-2" />
          Påkrevd merkingstekst{" "}
          <span className="fw-normal" style={{ opacity: 0.7 }}>
            (les mer)
          </span>
        </span>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </div>
      {open && (
        <div className="px-4 pb-3">
          {text.split("\n\n").map((para, i) => (
            <p key={i} className="mb-3">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerkingstekstAccordion;
