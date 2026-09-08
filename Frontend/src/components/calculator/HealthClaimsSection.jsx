import React, { useState } from "react";
import {
  translateSubstanceName,
  stripPercentageSuffix,
  getVisibleHealthClaims,
} from "../../../utils/calculator/nutritionResultHelpers";
import ClaimGrid from "./ClaimGrid";

// Plain click-to-toggle, no accordion styling/border — just hides the
// condition text behind a click instead of always showing it.
const VilkaarForBruk = ({ text }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="btn btn-link vilkaar-toggle p-0 fw-bold text-uppercase text-muted d-flex align-items-center gap-1"
        style={{ fontSize: "0.8rem" }}
        onClick={() => setOpen((o) => !o)}
      >
        Vilkår for bruk
        <i className={`bi bi-caret-${open ? "up" : "down"}-fill`} />
      </button>
      {open && (
        <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.85rem" }}>
          {text}
        </p>
      )}
    </div>
  );
};

const HealthClaimsSection = ({ result }) => {
  const visibleClaims = getVisibleHealthClaims(result);

  return (
    <ClaimGrid
      isEmpty={visibleClaims.length === 0}
      emptyMessage="Ingen EFSA-helsepåstander kan foreløpig utledes fra kildene som er lagt til."
      className="healthclaims-result-grid"
    >
      {visibleClaims.map((claim, i) => {
        const isLastInRow = i % 2 === 1 || i === visibleClaims.length - 1;
        const rows = Math.ceil(visibleClaims.length / 2);
        const isLastRow = i >= (rows - 1) * 2;

        return (
          <div
            key={i}
            className={`claim-grid-item p-4 d-flex flex-column justify-content-between h-100 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
            style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
          >
            <div className="d-flex flex-column gap-1">
              <p
                className="mb-2 fw-bold d-flex align-items-center gap-2"
                style={{ color: "#4379d6" }}
              >
                <i
                  className="bi bi-patch-check-fill"
                  style={{ color: "#4379d6", fontSize: "1rem" }}
                />
                {translateSubstanceName(claim.nutrient || "Ukjent")}

                <span className="text-muted small text-lowercase fw-normal ">
                  {stripPercentageSuffix(claim.amount)}
                </span>
              </p>
              <p className="mb-2" style={{ color: "#132745" }}>
                {claim.pastand}
              </p>

              {claim.vilkaarForBruk && (
                <VilkaarForBruk text={claim.vilkaarForBruk} />
              )}
            </div>

            {(claim.sourceUrl || claim.efsaQuestionUrl) && (
              <div
                className="mt-4 d-flex flex-column gap-1"
                style={{ opacity: 0.75, fontSize: "0.85rem" }}
              >
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
        );
      })}
    </ClaimGrid>
  );
};

export default HealthClaimsSection;
