import React from "react";
import efsaLogoGreen from "../../../../assets/img/efsaLogoGreen.png";
import { CLAIMS_CONFIG } from "../../../../utils/calculator/ClaimResult";
import {
  CLAIMS_BY_NAME,
  buildClaimStatistic,
  LIQUID_ONLY_CLAIMS,
  SOLID_ONLY_CLAIMS,
} from "../../../../utils/calculator/nutritionResultHelpers";
import StatBox from "./StatBox";
import SatisfiedAccordion from "./SatisfiedAccordion";

// Part 2 — EFSA: same card/two-panel layout as the Nøkkelhullet section above,
// but listing every possible claim for the category with its full detail text kept.
const EfsaSection = ({ result, nutrition, foodType }) => {
  const metNames = new Set(result.efsaNutritionClaims || []);
  const claims = Object.entries(CLAIMS_CONFIG)
    .filter(([key]) => {
      if (foodType === "solid" && LIQUID_ONLY_CLAIMS.has(key)) return false;
      if (foodType === "liquid" && SOLID_ONLY_CLAIMS.has(key)) return false;
      return true;
    })
    .map(([, cfg]) => ({
      name: cfg.name,
      cfg: CLAIMS_BY_NAME[cfg.name],
      met: metNames.has(cfg.name),
    }))
    .filter((c) => c.cfg);

  const unmetClaims = claims.filter((c) => !c.met);
  const metClaims = claims.filter((c) => c.met);
  const claimDetailText = ({ cfg, met }) =>
    met
      ? Array.isArray(cfg.metText)
        ? cfg.metText.join(" ")
        : cfg.metText
      : cfg.notMetLines.join(" ");

  const metCount = claims.filter((c) => c.met).length;
  const metFraction = claims.length > 0 ? (metCount / claims.length) * 100 : 0;
  const efsaOverallPassed = unmetClaims.length === 0;
  const allFailed = claims.length > 0 && metCount === 0;
  const leftColor = efsaOverallPassed || allFailed ? "#f0faf1" : "#343a40";
  const leftBg = efsaOverallPassed
    ? "#0f5132"
    : allFailed
      ? "#842029"
      : "#fafafa";

  return (
    <div>
      <h3 className="mb-3 fs-5 d-flex align-items-end">
        <img
          src={efsaLogoGreen}
          alt="EFSA"
          style={{ width: "2rem", height: "auto", marginRight: "0.75rem" }}
        />
        <span style={{ marginBottom: "0.125rem" }}>
          EFSA Ernæringspåstander
        </span>
      </h3>

      <div className="rounded bg-white result-grid gap-2">
        {/* Left: overall verdict — forced "Ikke oppfylt" when Nøkkelhullet fails — spans 2 rows */}
        <div
          className="px-3 py-4 rounded result-grid-left"
          style={{
            backgroundColor: leftBg,
            color: leftColor,
          }}
        >
          {claims.length === 0 ? (
            <p className="mb-0 px-2">
              Ingen EFSA-ernæringspåstander er mulige for denne kategorien.
            </p>
          ) : (
            <div className="px-2">
              {efsaOverallPassed ? (
                <p className="mb-3">
                  <strong>EFSA krav oppfylt.</strong> Produktet oppfyller alle{" "}
                  <strong>
                    {metCount} av {claims.length}
                  </strong>{" "}
                  mulige EFSA-ernæringspåstander for denne kategorien.
                </p>
              ) : (
                <p className="mb-3">
                  <strong>EFSA krav ikke oppfylt.</strong> Produktet oppfyller{" "}
                  <strong>
                    {metCount} av {claims.length}
                  </strong>{" "}
                  mulige EFSA-ernæringspåstander for denne kategorien.
                </p>
              )}

              <div
                className={`rounded-pill py-1 d-flex align-items-center justify-content-center position-relative overflow-hidden ${
                  efsaOverallPassed
                    ? "bg-success-subtle"
                    : allFailed
                      ? "bg-white"
                      : "bg-secondary-subtle"
                }`}
              >
                <div
                  className="rounded-pill position-absolute start-0"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: `${metFraction}%`,
                    backgroundColor:
                      efsaOverallPassed || allFailed ? "#fff" : "#b3b3b3",
                  }}
                />
                <span
                  className="position-relative"
                  style={{
                    zIndex: 1,
                    color: efsaOverallPassed
                      ? "#0f5132"
                      : allFailed
                        ? "#842029"
                        : "#212529",
                    fontWeight:
                      efsaOverallPassed || allFailed ? "bold" : undefined,
                  }}
                >
                  {Math.round(metFraction)}% påstander oppfylt
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: met claims always get their own box, so the calculator leads with what
            the product does qualify for — unless nothing is met, in which case show the
            unmet claims as cards instead. */}
        {(allFailed ? unmetClaims : metClaims).map(({ name, cfg, met }) => (
          <StatBox
            key={name}
            passed={met}
            title={cfg.name}
            statLine={buildClaimStatistic(cfg.key, nutrition)}
            statLineInBody
            bgClassName={
              allFailed
                ? "bg-danger-subtle"
                : efsaOverallPassed
                  ? "bg-success-subtle"
                  : undefined
            }
          >
            {claimDetailText({ cfg, met })}
          </StatBox>
        ))}

        {/* Bottom row: unmet claims collapsed into one accordion — not needed when nothing
            is met, since those are already shown as cards above. */}
        {!allFailed && unmetClaims.length > 0 && (
          <SatisfiedAccordion
            label="EFSA ernæringspåstander som ikke er oppfylt"
            items={unmetClaims}
            passed={false}
            icon={efsaLogoGreen}
            renderItem={({ cfg, met }) => {
              const statistic = buildClaimStatistic(cfg.key, nutrition);
              return (
                <>
                  <div className="d-flex align-items-start gap-2">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger flex-shrink-0"
                      style={{ width: "1.75rem", height: "1.75rem" }}
                    >
                      <i
                        className="bi bi-x-lg text-white"
                        style={{ fontSize: "0.9rem" }}
                      />
                    </span>
                    <span className="fw-bold">{cfg.name}</span>
                  </div>
                  <div className="mt-2">
                    {statistic && `${statistic}. `}
                    {claimDetailText({ cfg, met })}
                  </div>
                </>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EfsaSection;
