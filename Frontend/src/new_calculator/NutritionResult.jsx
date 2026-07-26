import React, { useState } from "react";
import keyholeLogo from "../img/new_resized_image_1.png";
import efsaLogo from "../img/efsaLogo.png";
import efsaLogoGreen from "../img/efsaLogoGreen.png";
import { CLAIMS_CONFIG } from "./ClaimResult.jsx";
import { EFSA_CLAIM_FIELDS } from "./efsaClaimFields";
import { evaluateNokkelhulletRequirements } from "./nokkelhulletEvaluation";
import { OTHER_SUBSTANCE_OPTIONS } from "./data/otherSubstanceOptions";

// Reverse lookup: backend claim name string (e.g. "Lavt Fettinnhold") -> CLAIMS_CONFIG entry/key.
const CLAIMS_BY_NAME = Object.fromEntries(
  Object.entries(CLAIMS_CONFIG).map(([key, cfg]) => [
    cfg.name,
    { ...cfg, key },
  ]),
);

// The backend echoes back the English substance name it was given (it's also the lookup
// key), so translate it to the Norwegian label for display.
const translateSubstanceName = (name) =>
  OTHER_SUBSTANCE_OPTIONS.find((o) => o.value === name)?.label || name;

// Labels for the nutrition-table fields, used to build the per-claim statistic line.
const FIELD_LABELS = {
  fett: "Fett",
  mettede: "Mettede fettsyrer",
  transfett: "Transfett",
  karbohydrat: "Karbohydrat",
  naturligSukker: "Naturlig sukker",
  hvoravSukkerarter: "Tilsatt sukker",
  kostfiber: "Kostfiber",
  protein: "Protein",
  naturligSalt: "Naturlig salt",
  tilsattSalt: "Tilsatt salt",
};

// Builds "Fett: 7 g/100 g, Salt: 0.3 g/100 g" for the fields a given claim depends on.
const buildClaimStatistic = (claimKey, nutrition) => {
  const fields = EFSA_CLAIM_FIELDS[claimKey] || [];
  if (fields.length === 0 || !nutrition) return null;
  return fields
    .map((f) => `${FIELD_LABELS[f] || f}: ${Number(nutrition[f]) || 0} g/100 g`)
    .join(", ");
};

// A single collapsible stat/claim row — header (icon + bold title + stat) always visible,
// detail text collapses behind a click so a long list of boxes doesn't read as a wall of text.
const StatBox = ({ passed, title, statLine, children }) => {
  const color = passed ? "#0f5132" : "#343a40";
  const bg = passed ? "#f0faf1" : "#f8f9fa";

  return (
    <div
      className="rounded p-4 d-flex flex-column"
      style={{ backgroundColor: bg, color }}
    >
      <div className="d-flex align-items-start gap-2">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${passed ? "bg-success" : "bg-danger"}`}
          style={{ width: "1.75rem", height: "1.75rem" }}
        >
          <i
            className={`bi ${passed ? "bi-check-lg" : "bi-x-lg"} text-white`}
            style={{ fontSize: "0.9rem" }}
          />
        </span>
        <div>
          <span className="fw-bold">{title}</span>
          {statLine && (
            <>
              : <strong>{statLine}</strong>
            </>
          )}
        </div>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

// A single full-width accordion row listing every *satisfied* item compactly — used so the
// grid above only needs to surface the failing/unsatisfied claims as individual boxes.
const SatisfiedAccordion = ({ label, items, renderItem, logo }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="rounded px-4 py-3 satisfied-accordion-header"
      style={{
        gridColumn: "1 / -1",
        color: "#343a40",
        cursor: "pointer",
      }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="d-flex align-items-center justify-content-between">
        <span className="fw-bold d-flex align-items-center gap-2">
          {logo && (
            <img
              src={logo}
              alt=""
              style={{ width: "1.5rem", height: "auto" }}
            />
          )}
          {label} ({items.length})
        </span>
        <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </div>
      {expanded && (
        <div className="mt-3 satisfied-accordion-grid">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded d-flex align-items-start gap-2"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success flex-shrink-0"
                style={{ width: "1.4rem", height: "1.4rem" }}
              >
                <i
                  className="bi bi-check-lg text-white"
                  style={{ fontSize: "0.75rem" }}
                />
              </span>
              <div>{renderItem(item)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Part 1 — Nøkkelhullet: overall verdict plus every requirement for this category, each
// marked pass/fail individually (not just the failing ones).
const NokkelhulletSection = ({ result, category, nutrition }) => {
  const requirements = evaluateNokkelhulletRequirements(category, nutrition);
  const passed = result.hasNokkelhullet === true;
  const failed = result.hasNokkelhullet === false;
  const failedReqs = requirements.filter((r) => !r.passed);
  const passedReqs = requirements.filter((r) => r.passed);
  const failedCount = failedReqs.length;
  const passedCount = passedReqs.length;
  const passedFraction =
    requirements.length > 0 ? (passedCount / requirements.length) * 100 : 0;
  const renderReqDetail = (req) => (
    <>
      {req.actualValue} {req.comparator} {req.thresholdValue} {req.unit}
    </>
  );

  return (
    <div>
      <h3 className="mb-3 d-flex align-items-center">
        <img
          src={keyholeLogo}
          alt="Nøkkelhullet"
          style={{ width: "2.5rem", height: "auto", marginRight: "0.75rem" }}
        />
        Nøkkelhullet
      </h3>
      <div className="rounded bg-white result-grid">
        {/* Left: text summary, tinted to match the verdict — spans 2 rows */}
        <div
          className="px-3 py-4 rounded result-grid-left"
          style={{
            backgroundColor: passed
              ? "#0f5132"
              : failed
                ? "#f8f9fa"
                : "#f8f9fa",
            color: passed ? "#f0faf1" : "#343a40",
          }}
        >
          <div className="d-flex justify-content-start mb-3">
            <span
              className={`badge rounded-pill fs-6 ${
                passed ? "bg-success" : failed ? "bg-danger" : "bg-secondary"
              }`}
            >
              <i
                className={`bi ${passed ? "bi-check-circle" : failed ? "bi-x-circle" : "bi-question-circle"} me-1`}
              />
              {passed
                ? "Nøkkelhullet krav oppfylt"
                : failed
                  ? "Nøkkelhullet krav ikke oppfylt"
                  : "Nøkkelhullet ukjent"}
            </span>
          </div>

          {requirements.length === 0 ? (
            <p className="mb-0 px-2 mt-4">
              Det finnes ingen spesifikke krav til næringsinnhold for denne
              kategorien.
            </p>
          ) : (
            <div className="px-2 mt-4">
              <div className="d-flex align-items-baseline mb-2">
                <span
                  className="fw-bold"
                  style={{ fontSize: "2.5rem", lineHeight: 1 }}
                >
                  {passedCount}
                </span>
                <span className="fs-5" style={{ opacity: 0.85 }}>
                  / {requirements.length} krav oppfylt
                </span>
              </div>
              <div
                className="rounded-pill mb-3"
                style={{
                  height: "0.5rem",
                  backgroundColor: passed
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.15)",
                }}
              >
                <div
                  className="rounded-pill h-100"
                  style={{
                    width: `${passedFraction}%`,
                    backgroundColor: passed ? "#fff" : "#6c757d",
                  }}
                />
              </div>

              {passed ? (
                <p className="mb-0">
                  Produktet oppfyller{" "}
                  <strong>alle {requirements.length}</strong> krav for
                  Nøkkelhullet i denne kategorien.
                </p>
              ) : (
                <p className="mb-0">
                  Produktet oppfyller ikke <strong>{failedCount}</strong> av{" "}
                  <strong>{requirements.length}</strong> krav for Nøkkelhullet i
                  denne kategorien. Se statistikken til høyre for hvilke krav
                  som ikke er innfridd.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: failed requirements get their own box. If nothing failed, show the
            satisfied ones as boxes too instead of hiding everything behind the accordion. */}
        {(failedReqs.length > 0 ? failedReqs : passedReqs).map((req) => (
          <StatBox
            key={req.key}
            passed={req.passed}
            title={req.nutrient}
            statLine={renderReqDetail(req)}
          >
            {req.description}
          </StatBox>
        ))}

        {/* Bottom row: satisfied requirements collapsed into one accordion — only needed
            when there are also failed ones shown above; otherwise they're already boxes. */}
        {failedReqs.length > 0 && (
          <SatisfiedAccordion
            label="Krav som er oppfylt"
            logo={keyholeLogo}
            items={passedReqs}
            renderItem={(req) => (
              <>
                <div>
                  <span className="fw-bold">{req.nutrient}:</span>{" "}
                  {renderReqDetail(req)}
                </div>
                <div>{req.description}</div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

// Claims that are liquid-only or solid-only — keyed by CLAIMS_CONFIG key.
// Liquid-only: energyFree (never applies to solid food)
// Solid-only: increasedHighFibre, reducedHighFibre (backend always returns false for liquid)
const LIQUID_ONLY_CLAIMS = new Set(["energyFree"]);
const SOLID_ONLY_CLAIMS = new Set(["increasedHighFibre", "reducedHighFibre"]);

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
  const leftBg = efsaOverallPassed ? "#0f5132" : "#f8f9fa";

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

      <div className="alert alert-warning mb-4 d-flex align-items-start gap-2">
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

const MerkingstekstAccordion = ({ text }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded mt-3"
      style={{ backgroundColor: "#e8f5e9", color: "#1a4731" }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fw-bold">
          <i className="bi bi-info-circle me-2" />
          Påkrevd merkingstekst{" "}
          <span className="fw-normal" style={{ opacity: 0.7 }}>
            (les mer)
          </span>
        </span>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`} />
      </div>
      {open && (
        <div className="px-4 pb-3">
          {text.split("\n\n").map((para, i) => (
            <p key={i} className="mb-3">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

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

// Part 3 — EFSA health claims. Combines carbohydrate claims and ingredient-based claims
// (vitamins, minerals, other substances), grouped by nutrient. Each nutrient gets one box.
const HealthClaimsSection = ({ result }) => {
  const allClaims = [
    ...(result.efsaHealthClaims || []),
    ...(result.ingredientHealthClaims || []),
  ];
  const visibleClaims = allClaims.filter(
    (c) => c.meetsRequirement !== "Oppfyller ikke gitt krav",
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

      <div className="alert alert-warning mb-4 d-flex align-items-start gap-2">
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

// Template for the summary line under the "Resultat" heading. {placeholders} are
// swapped out with the live result data in buildResultSummary below.
const buildResultSummary = (result, foodType) => {
  const nokkelhulletPassed = result.hasNokkelhullet === true;
  const efsaTotalCount = Object.entries(CLAIMS_CONFIG).filter(([key]) => {
    if (foodType === "solid" && LIQUID_ONLY_CLAIMS.has(key)) return false;
    if (foodType === "liquid" && SOLID_ONLY_CLAIMS.has(key)) return false;
    return true;
  }).length;
  const efsaMetCount = (result.efsaNutritionClaims || []).length;

  return (
    `Nøkkelhullet er ${nokkelhulletPassed ? "oppfylt" : "ikke oppfylt"} for denne kategorien. ` +
    `${efsaMetCount} av ${efsaTotalCount} mulige EFSA-ernæringspåstander er oppfylt.`
  );
};

// Energy has to come from fat/carbs/protein/fibre — if all four are 0 but energy isn't,
// that's physically impossible for a solid, and unusual (only alcohol/polyols/organic acids
// could explain it) for a liquid. Flag it without blocking anything.
const getEnergyMismatchWarning = (nutrition, foodType) => {
  if (!nutrition) return null;

  const fat = Number(nutrition.fett) || 0;
  const carbs = Number(nutrition.karbohydrat) || 0;
  const protein = Number(nutrition.protein) || 0;
  const fibre = Number(nutrition.kostfiber) || 0;
  const hasEnergy =
    (Number(nutrition.energikcal) || 0) > 0 ||
    (Number(nutrition.energikj) || 0) > 0;
  const allMacrosZero =
    fat === 0 && carbs === 0 && protein === 0 && fibre === 0;

  if (!hasEnergy || !allMacrosZero) return null;

  return foodType === "solid"
    ? "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. Dette er normalt ikke mulig for et fast produkt, siden energi kommer fra disse næringsstoffene. Kontroller verdiene."
    : "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene er riktige.";
};

// General case (covers more than the all-zero one above): the entered energy should be
// roughly what fat/carbs/protein/fibre add up to, using the EU's fixed conversion factors
// (9/4/4/2 kcal per gram, or 37/17/17/8 kJ per gram). A big gap either way — energy far
// higher or far lower than the macros justify — usually means a data-entry mistake.
const getEnergyFormulaWarning = (nutrition, foodType) => {
  if (!nutrition) return null;

  const fat = Number(nutrition.fett) || 0;
  const carbs = Number(nutrition.karbohydrat) || 0;
  const protein = Number(nutrition.protein) || 0;
  const fibre = Number(nutrition.kostfiber) || 0;
  const allMacrosZero = fat === 0 && carbs === 0 && protein === 0 && fibre === 0;
  if (allMacrosZero) return null; // already covered by getEnergyMismatchWarning

  const energyKcal = Number(nutrition.energikcal) || 0;
  const energyKj = Number(nutrition.energikj) || 0;

  let entered, expected, unit;
  if (energyKcal > 0) {
    entered = energyKcal;
    expected = fat * 9 + carbs * 4 + protein * 4 + fibre * 2;
    unit = "kcal";
  } else if (energyKj > 0) {
    entered = energyKj;
    expected = fat * 37 + carbs * 17 + protein * 17 + fibre * 8;
    unit = "kJ";
  } else {
    return null;
  }

  if (expected <= 0) return null;

  // Outside roughly half to 1.5x the expected value — generous enough to allow for
  // label rounding and untracked substances (alcohol, polyols, organic acids).
  const ratio = entered / expected;
  if (ratio >= 0.5 && ratio <= 1.5) return null;

  return (
    `Du har oppgitt ${entered} ${unit} energi, mens fett er ${fat} g, karbohydrat er ${carbs} g, ` +
    `protein er ${protein} g og kostfiber er ${fibre} g. ` +
    (foodType === "solid"
      ? "Kontroller at disse stemmer med hverandre."
      : "Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene stemmer med hverandre.")
  );
};

const NutritionResult = ({
  result,
  category,
  nutrition,
  foodType,
  showHealthClaimsPanel,
}) => {
  if (!result) return null;

  const energyMismatchWarning = getEnergyMismatchWarning(nutrition, foodType);
  const energyFormulaWarning = getEnergyFormulaWarning(nutrition, foodType);

  return (
    <div>
      <h2 className="mb-1">Resultat</h2>
      <p className="text-muted mb-3">{buildResultSummary(result, foodType)}</p>
      {(energyMismatchWarning || energyFormulaWarning) && (
        <div className="alert alert-warning mb-4">
          {energyMismatchWarning && (
            <div className="d-flex align-items-start gap-2 mb-2">
              <i className="bi bi-exclamation-triangle flex-shrink-0 mt-1" />
              <span className="mt-1">{energyMismatchWarning}</span>
            </div>
          )}
          {energyFormulaWarning && (
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-exclamation-triangle flex-shrink-0 mt-1" />
              <span className="mt-1">{energyFormulaWarning}</span>
            </div>
          )}
        </div>
      )}
      <div className="d-flex flex-column gap-5">
        <NokkelhulletSection
          result={result}
          category={category}
          nutrition={nutrition}
        />
        <EfsaSection
          result={result}
          nutrition={nutrition}
          foodType={foodType}
        />
        {showHealthClaimsPanel && <HealthClaimsSection result={result} />}
      </div>
    </div>
  );
};

export default NutritionResult;
