import React from "react";
import {
  CLAIMS_BY_NAME,
  buildClaimStatistic,
  buildClaimDetailText,
  getApplicableClaims,
} from "../../utils/calculator/nutritionResultHelpers";
import ClaimGrid from "./ClaimGrid";

const EfsaSection = ({ result, nutrition, foodType }) => {
  const metNames = new Set(result.efsaNutritionClaims || []);
  const claims = getApplicableClaims(foodType)
    .map(({ cfg }) => ({
      name: cfg.name,
      cfg: CLAIMS_BY_NAME[cfg.name],
      met: metNames.has(cfg.name),
    }))
    .filter((c) => c.cfg);

  return (
    <ClaimGrid
      isEmpty={claims.length === 0}
      emptyMessage="Ingen EFSA-ernæringspåstander er mulige for denne kategorien."
    >
      {claims.map(({ name, cfg, met }, i) => {
        const isLastInRow = i % 2 === 1 || i === claims.length - 1;
        const rows = Math.ceil(claims.length / 2);
        const isLastRow = i >= (rows - 1) * 2;
        const statLine = buildClaimStatistic(cfg.key, nutrition);

        return (
          <div
            key={name}
            className={`claim-grid-item p-4 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
            style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
          >
            <p
              className={`mb-2 fw-bold  d-flex align-items-center gap-2 ${met ? "text-success-emphasis" : "text-danger-emphasis"}`}
            >
              <i
                className={`bi ${met ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                style={{ color: met ? "#198754" : "#dc3545", fontSize: "1rem" }}
              />
              {cfg.name}
            </p>
            <p className="mb-0" style={{ color: met ? "#062814" : "#3b0c0f" }}>
              {statLine ? `${statLine}. ` : ""}
              {buildClaimDetailText(cfg, met)}
            </p>
          </div>
        );
      })}
    </ClaimGrid>
  );
};

export default EfsaSection;
