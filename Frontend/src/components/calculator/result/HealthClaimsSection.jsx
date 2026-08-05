import React from "react";
import efsaLogo from "../../../assets/img/efsaLogo.png";
import { translateSubstanceName } from "../../../utils/calculator/nutritionResultHelpers";
import StatBox from "./StatBox";
import ClaimRow from "./ClaimRow";

// Part 3 — EFSA health claims. Combines carbohydrate claims and ingredient-based claims
// (vitamins, minerals, other substances), grouped by nutrient. Each nutrient gets one box.
const HealthClaimsSection = ({ result }) => {
  const allClaims = [
    ...(result.efsaHealthClaims || []),
    ...(result.ingredientHealthClaims || []),
  ];
  // Only claims explicitly verified as met belong under the "this product CAN claim"
  // heading below — anything else (failed, or unverifiable e.g. missing portion size /
  // requires body weight) must not be shown as if it qualifies.
  const visibleClaims = allClaims.filter(
    (c) => c.meetsRequirement === "Oppfyller gitt krav",
  );

  const groups = visibleClaims.reduce((acc, claim) => {
    const key = translateSubstanceName(claim.nutrient || "Ukjent");
    if (!acc[key]) acc[key] = [];
    acc[key].push(claim);
    return acc;
  }, {});

  return (
    <div>
      <h3 className="mb-3 d-flex align-items-center">
        <img
          src={efsaLogo}
          alt="EFSA"
          style={{ width: "2.5rem", height: "auto", marginRight: "0.75rem" }}
        />
        EFSA Helsepåstander
      </h3>

      <div className="alert alert-warning border-0 mb-4 d-flex align-items-start gap-2">
        <i
          className="bi bi-tools flex-shrink-0 mt-1"
          title="Under utvikling"
        />
        <span className="mt-1">
          EFSA helsepåstander er foreløpig begrenset til{" "}
          <strong>fiberkilder og karbohydrat</strong>.
        </span>
      </div>

      {visibleClaims.length === 0 ? (
        <p className="text-muted mb-0">
          Ingen EFSA-helsepåstander kan foreløpig utledes fra kildene som er
          lagt til.
        </p>
      ) : (
        <div className="d-flex flex-column gap-4">
          {Object.entries(groups).map(([nutrient, groupClaims]) => (
            <StatBox
              key={nutrient}
              passed
              title={nutrient}
              statLine={groupClaims[0]?.amount}
            >
              <p className="mb-3">
                Dette produktet <strong>kan</strong> bidra til følgende
                helsepåstander:
              </p>
              <div className="d-flex flex-column gap-4">
                {groupClaims.map((claim, i) => (
                  <ClaimRow key={i} claim={claim} index={i} />
                ))}
              </div>
            </StatBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthClaimsSection;
