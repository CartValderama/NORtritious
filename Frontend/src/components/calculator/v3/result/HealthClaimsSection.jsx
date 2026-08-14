import React from "react";
import efsaLogo from "../../../../assets/img/efsaLogo.png";
import { translateSubstanceName } from "../../../../utils/calculator/nutritionResultHelpers";

// Part 3 — EFSA health claims. Combines carbohydrate claims and ingredient-based claims
// (vitamins, minerals, other substances). Each qualifying claim gets its own grid card:
// nutrient + amount as the header, the claim text as the body, and the regulation/EFSA
// opinion reference at the bottom.
const HealthClaimsSection = ({ result }) => {
  const allClaims = [
    ...(result.efsaHealthClaims || []),
    ...(result.ingredientHealthClaims || []),
  ];
  // Only claims explicitly verified as met belong here — anything else (failed, or
  // unverifiable e.g. missing portion size / requires body weight) must not be shown
  // as if it qualifies.
  const visibleClaims = allClaims.filter(
    (c) => c.meetsRequirement === "Oppfyller gitt krav",
  );

  return (
    <div>
      <h3 className="mb-3 fs-5 d-flex align-items-end">
        <img
          src={efsaLogo}
          alt="EFSA"
          style={{ width: "2rem", height: "auto", marginRight: "0.75rem" }}
        />
        <span style={{ marginBottom: "0.125rem" }}>EFSA Helsepåstander</span>
      </h3>

      {visibleClaims.length === 0 ? (
        <p className="text-muted mb-0">
          Ingen EFSA-helsepåstander kan foreløpig utledes fra kildene som er
          lagt til.
        </p>
      ) : (
        <div className="healthclaims-grid gap-2">
          {visibleClaims.map((claim, i) => (
            <div key={i} className="rounded pt-3 pb-4 px-4 bg-primary-subtle">
              <p className="fw-bold mb-2 d-flex align-items-center gap-2">
                <i
                  className="bi bi-patch-check-fill text-primary"
                  style={{ fontSize: "1.6rem" }}
                />
                {translateSubstanceName(claim.nutrient || "Ukjent")}
                {claim.amount && `: ${claim.amount}`}
              </p>
              <p className="mb-2">
                <strong>Kan bidra til:</strong> {claim.pastand}
              </p>

              {(claim.sourceUrl || claim.efsaQuestionUrl) && (
                <div
                  className="mt-2"
                  style={{ opacity: 0.75, fontSize: "0.85rem" }}
                >
                  {claim.sourceUrl && (
                    <a
                      href={claim.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      {claim.legislationReference ||
                        "EU Health Claims Register"}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthClaimsSection;
