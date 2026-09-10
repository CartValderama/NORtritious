import React, { useState } from "react";
import {
  stripPercentageSuffix,
  getAllHealthClaims,
  getClaimStatus,
} from "../../utils/calculator/nutritionResultHelpers";
import ClaimGrid from "./ClaimGrid";

// Three states, not two. "Undetermined" is for conditions the calculator deliberately
// doesn't judge (missing input, or a requirement that isn't about composition) — showing
// those in the same red as a genuine miss would claim the product fell short when it was
// never assessed.
const CLAIM_STYLES = {
  met: { color: "#4379d6", icon: "bi-patch-check-fill", button: "btn-light-primary" },
  notMet: { color: "#b02a37", icon: "bi-x-circle-fill", button: "btn-light-secondary" },
  undetermined: { color: "#6c757d", icon: "bi-dash-circle-fill", button: "btn-light-secondary" },
};

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
  const allClaims = getAllHealthClaims(result);

  return (
    <ClaimGrid
      isEmpty={allClaims.length === 0}
      emptyMessage="Ingen kilder er lagt til ennå."
      className="healthclaims-result-grid"
    >
      {allClaims.map((claim, i) => {
        const isLastInRow = i % 2 === 1 || i === allClaims.length - 1;
        const rows = Math.ceil(allClaims.length / 2);
        const isLastRow = i >= (rows - 1) * 2;
        const status = getClaimStatus(claim.meetsRequirement);
        const style = CLAIM_STYLES[status];
        const passed = status === "met";
        const accentColor = style.color;

        return (
          <div
            key={i}
            className={`claim-grid-item p-4 d-flex flex-column justify-content-between h-100 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
            style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
          >
            <div className="d-flex flex-column gap-1">
              <p
                className="mb-2 fw-bold d-flex align-items-center gap-2"
                style={{ color: accentColor }}
              >
                <i
                  className={`bi ${style.icon}`}
                  style={{ color: accentColor, fontSize: "1rem" }}
                />
                {claim.nutrient || "Ukjent"}

                <span className="text-muted small text-lowercase fw-normal ">
                  {stripPercentageSuffix(claim.amount)}
                </span>
              </p>
              {!passed && (
                <p className="mb-2" style={{ color: accentColor }}>
                  {claim.meetsRequirement}
                </p>
              )}
              <p className="mb-2" style={{ color: "#132745" }}>
                {claim.pastand}
              </p>

              {claim.vilkaarForBruk && <VilkaarForBruk text={claim.vilkaarForBruk} />}
            </div>

            {(claim.sourceUrl || claim.efsaQuestionUrl) && (
              <div
                className="mt-4"
                style={{ display: "inline-grid", gap: "0.5rem" }}
              >
                {claim.sourceUrl && (
                  <a
                    href={claim.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${style.button} btn-sm text-start d-inline-flex align-items-center gap-2`}
                    style={{ textDecoration: "none", fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-box-arrow-up-right" style={{ flexShrink: 0 }} />
                    Les forordningen som godkjenner påstanden
                  </a>
                )}
                {claim.efsaQuestionUrl && (
                  <a
                    href={claim.efsaQuestionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${style.button} btn-sm text-start d-inline-flex align-items-center gap-2`}
                    style={{ textDecoration: "none", fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-box-arrow-up-right" style={{ flexShrink: 0 }} />
                    {claim.efsaQuestionTitle || "Les EFSA-uttalelsen"}
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
