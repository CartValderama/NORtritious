import React from "react";
import { formatNoNumber } from "../../utils/calculator/nutritionFormFields";
import ClaimGrid from "./ClaimGrid";

// Which claims apply and whether each was met both come from the response now. The backend
// already decided both, and deriving the list here a second time meant the category gate and
// the solid/liquid gate had to be kept identical in two places.
const EfsaSection = ({ result }) => {
  const claims = result.efsaNutritionClaimResults || [];

  return (
    <ClaimGrid
      isEmpty={claims.length === 0}
      emptyMessage="Ingen EFSA-ernæringspåstander er mulige for denne kategorien."
    >
      {claims.map(({ key, label, passed, explanation, actualValue, thresholdUnit }, i) => {
        const isLastInRow = i % 2 === 1 || i === claims.length - 1;
        const rows = Math.ceil(claims.length / 2);
        const isLastRow = i >= (rows - 1) * 2;

        return (
          <div
            key={key}
            className={`claim-grid-item p-4 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
            style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
          >
            <p
              className={`mb-2 fw-bold  d-flex align-items-center gap-2 ${passed ? "text-success-emphasis" : "text-danger-emphasis"}`}
            >
              <i
                className={`bi ${passed ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                style={{ color: passed ? "#198754" : "#dc3545", fontSize: "1rem" }}
              />
              {label}
            </p>
            <p className="mb-0" style={{ color: passed ? "#062814" : "#3b0c0f" }}>
              {`Produktet inneholder ${formatNoNumber(actualValue)} ${thresholdUnit}. `}
              {explanation}
            </p>
          </div>
        );
      })}
    </ClaimGrid>
  );
};

export default EfsaSection;
