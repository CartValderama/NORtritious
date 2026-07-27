import React from "react";
import efsaLogoGreen from "../../../assets/img/efsaLogoGreen.png";
import { CLAIMS_CONFIG } from "../../../utils/calculator/ClaimResult";
import {
  CLAIMS_BY_NAME,
  buildClaimStatistic,
  LIQUID_ONLY_CLAIMS,
  SOLID_ONLY_CLAIMS,
} from "../../../utils/calculator/nutritionResultHelpers";
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
  const leftColor = efsaOverallPassed ? "#f0faf1" : "#343a40";
  const leftBg = efsaOverallPassed ? "#0f5132" : "#fafafa";

  return (
    <div>
      <h3 className="mb-3 d-flex align-items-center">
        <img
          src={efsaLogoGreen}
          alt="EFSA"
          style={{ width: "2.5rem", height: "auto", marginRight: "0.75rem" }}
        />
        EFSA Ernæringspåstander
      </h3>

      <div className="alert alert-warning border-0 mb-4 d-flex align-items-start gap-2">
        <i
          className="bi bi-tools flex-shrink-0 mt-1"
          title="Under utvikling"
        />
        <span className="mt-1">
          EFSA ernæringspåstander er foreløpig begrenset til{" "}
          <strong>fiber, energi og karbohydrat</strong>. Søtningsstoffer
          (bordsøtning) måles eller beregnes foreløpig ikke. «Energiredusert»
          beregnes heller ikke, siden det krever en sammenligning med et
          tilsvarende produkt.
        </span>
      </div>

      <div className="rounded bg-white result-grid">
        {/* Left: overall verdict — forced "Ikke oppfylt" when Nøkkelhullet fails — spans 2 rows */}
        <div
          className="px-3 py-4 rounded result-grid-left"
          style={{
            backgroundColor: leftBg,
            color: leftColor,
          }}
        >
          <div className="d-flex justify-content-start mb-3">
            <span
              className={`badge rounded-pill fs-6 ${
                efsaOverallPassed ? "bg-success" : "bg-danger"
              }`}
            >
              <i
                className={`bi ${efsaOverallPassed ? "bi-check-circle" : "bi-x-circle"} me-1`}
              />
              {efsaOverallPassed
                ? "EFSA krav oppfylt"
                : "EFSA krav ikke oppfylt"}
            </span>
          </div>

          {claims.length === 0 ? (
            <p className="mb-0 px-2">
              Ingen EFSA-ernæringspåstander er mulige for denne kategorien.
            </p>
          ) : (
            <div className="px-2">
              <div className="d-flex align-items-baseline mb-2">
                <span
                  className="fw-bold"
                  style={{ fontSize: "2.5rem", lineHeight: 1 }}
                >
                  {metCount}
                </span>
                <span className="fs-5" style={{ opacity: 0.85 }}>
                  / {claims.length} påstander oppfylt
                </span>
              </div>
              <div
                className="rounded-pill mb-3"
                style={{
                  height: "0.5rem",
                  backgroundColor: efsaOverallPassed
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.15)",
                }}
              >
                <div
                  className="rounded-pill h-100"
                  style={{
                    width: `${metFraction}%`,
                    backgroundColor: efsaOverallPassed ? "#fff" : "#6c757d",
                  }}
                />
              </div>
              {efsaOverallPassed ? (
                <p className="mb-0">
                  Produktet oppfyller <strong>alle {claims.length}</strong>{" "}
                  EFSA-ernæringspåstander som er mulige for denne kategorien.
                </p>
              ) : (
                <p className="mb-0">
                  <strong>{metCount}</strong> av{" "}
                  <strong>{claims.length}</strong> påstander er oppfylt. Se
                  statistikken til høyre for hvilke som ikke er innfridd.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: unmet claims get their own box. If nothing is unmet, show the met
            claims as boxes too instead of hiding everything behind the accordion. */}
        {(unmetClaims.length > 0 ? unmetClaims : metClaims).map(
          ({ name, cfg, met }) => (
            <StatBox
              key={name}
              passed={met}
              title={cfg.name}
              statLine={buildClaimStatistic(cfg.key, nutrition)}
            >
              {claimDetailText({ cfg, met })}
            </StatBox>
          ),
        )}

        {/* Bottom row: met claims collapsed into one accordion — only needed when there
            are also unmet ones shown above; otherwise they're already boxes. */}
        {unmetClaims.length > 0 && (
          <SatisfiedAccordion
            label="Påstander som er oppfylt"
            logo={efsaLogoGreen}
            items={metClaims}
            renderItem={({ cfg, met }) => {
              const statistic = buildClaimStatistic(cfg.key, nutrition);
              return (
                <>
                  <div>
                    <span className="fw-bold">{cfg.name}</span>
                    {statistic && (
                      <>
                        : <strong>{statistic}</strong>
                      </>
                    )}
                  </div>
                  <div>{claimDetailText({ cfg, met })}</div>
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
