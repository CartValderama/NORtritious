import React from "react";
import MerkingstekstAccordion from "./MerkingstekstAccordion";

// One claim entry rendered as the three official regulation-table columns.
const ClaimRow = ({ claim, index }) => (
  <div>
    <p className="mb-2 d-flex align-items-start gap-2">
      <i
        className={`bi bi-${index + 1}-circle-fill flex-shrink-0`}
        style={{ fontSize: "1.4rem", color: "#0f5132" }}
      />
      <span>{claim.pastand}</span>
    </p>
    <div style={{ minWidth: 0 }}>
      {/* All conditions collapsed into one accordion */}
      {(claim.vilkaarForBruk || claim.vilkaarOgBegrensninger) && (
        <MerkingstekstAccordion
          text={[claim.vilkaarForBruk, claim.vilkaarOgBegrensninger]
            .filter(Boolean)
            .join("\n\n")}
        />
      )}

      {/* This claim's own regulation + EFSA opinion — each claim can cite a different one */}
      {(claim.sourceUrl || claim.efsaQuestionUrl) && (
        <div className="mt-2" style={{ opacity: 0.75, fontSize: "0.85rem" }}>
          <i className="bi bi-book me-1" />
          {claim.sourceUrl && (
            <a
              href={claim.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              {claim.legislationReference || "EU Health Claims Register"}
            </a>
          )}
          {claim.sourceUrl && claim.efsaQuestionUrl && " · "}
          {claim.efsaQuestionUrl && (
            <a
              href={claim.efsaQuestionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}
            >
              EFSA-uttalelse {claim.efsaQuestion}
            </a>
          )}
        </div>
      )}
    </div>
  </div>
);

export default ClaimRow;
