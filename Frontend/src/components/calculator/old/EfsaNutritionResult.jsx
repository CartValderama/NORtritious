import React, { useState } from "react";
import efsaLogoGreen from "../../../assets/img/efsaLogoGreen.png";
import { CLAIMS_CONFIG } from "../../../utils/calculator/ClaimResult";
import {
  LIQUID_ONLY_CLAIMS,
  SOLID_ONLY_CLAIMS,
} from "../../../utils/calculator/nutritionResultHelpers";

// Fake claims, clearly labeled as such — not real data. Toggled on to demonstrate
// that omitting descriptions doesn't solve the real problem: this box's real scope
// today is just energy/carbs/fibre, and the page will keep growing every time a new
// claim type gets added, regardless of how compact each individual entry is.
// 14 = average number of EFSA nutrition claims per matkategori (counted from the
// mapping spreadsheet) — the realistic total this box should demo, so however many
// real claims already exist, only the shortfall up to 14 gets filled with dummies.
const DEMO_CLAIM_TARGET = 14;
const buildDemoClaims = (existingCount) => {
  const count = Math.max(0, DEMO_CLAIM_TARGET - existingCount);
  return Array.from({ length: count }, (_, i) => ({
    name: `Dummy-påstand ${i + 1} (demo)`,
    met: i % 2 === 0,
  }));
};

// Pre-rewrite-style Ernæringspåstander box, same green/red + expand pattern as
// NokkelhulletResult. Same underlying data (CLAIMS_CONFIG, result.efsaNutritionClaims)
// as the "new" design's EfsaSection.jsx.
const EfsaNutritionResult = ({ result, foodType, nutrition }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDemoClaims, setShowDemoClaims] = useState(false);
  const metNames = new Set(result?.efsaNutritionClaims || []);
  const realClaims = result
    ? Object.entries(CLAIMS_CONFIG)
        .filter(([key]) => {
          if (foodType === "solid" && LIQUID_ONLY_CLAIMS.has(key)) return false;
          if (foodType === "liquid" && SOLID_ONLY_CLAIMS.has(key)) return false;
          return true;
        })
        .map(([, cfg]) => ({ name: cfg.name, met: metNames.has(cfg.name) }))
    : [];
  const claims = showDemoClaims
    ? [...realClaims, ...buildDemoClaims(realClaims.length)]
    : realClaims;

  const allMet = claims.length > 0 && claims.every((c) => c.met);
  const canExpand = result && claims.length > 0;

  return (
    <div
      className={
        !result ? "bg-secondary-subtle" : allMet ? "bg-success-subtle" : "bg-danger-subtle"
      }
      style={{ padding: "1.5em", borderRadius: "0.7em", cursor: canExpand ? "pointer" : undefined }}
      onClick={canExpand ? () => setIsExpanded((v) => !v) : undefined}
    >
      <div className={result ? "d-flex align-items-center mb-3" : "d-flex align-items-center"}>
        <img
          src={efsaLogoGreen}
          alt="EFSA"
          style={{ width: "2.5rem", height: "auto", marginRight: "1em" }}
        />
        <h5 className="mb-0" style={{ minWidth: 0 }}>
          EFSA Ernæringspåstander
        </h5>
        {result && (
          <div className="ms-auto d-flex align-items-center gap-3">
            <i
              className="bi bi-magic"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                setShowDemoClaims((v) => !v);
                setIsExpanded(true);
              }}
              title={
                showDemoClaims
                  ? "Fjern demo-påstander"
                  : `Demo: fyll opp til ${DEMO_CLAIM_TARGET} påstander (gjennomsnittet per matkategori) med dummy-data`
              }
            />
            {claims.length > 0 && (
              <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
            )}
          </div>
        )}
      </div>
      {result && (
        <p className="mb-0">
          {claims.filter((c) => c.met).length} av {claims.length} mulige
          EFSA-ernæringspåstander er oppfylt.
        </p>
      )}
      {isExpanded && (
        <div className="mt-3 d-flex flex-column gap-1">
          {claims.map((c) => (
            <div
              key={c.name}
              className="rounded py-2 px-3 d-flex align-items-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
            >
              {c.met ? (
                <i className="bi bi-check-circle-fill text-success me-2 flex-shrink-0" />
              ) : (
                <i className="bi bi-x-circle-fill text-danger me-2 flex-shrink-0" />
              )}
              <span style={{ minWidth: 0 }}>{c.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EfsaNutritionResult;
