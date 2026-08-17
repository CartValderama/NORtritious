import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/Calculator.css";
import {
  evaluateNokkelhulletRequirements,
  buildRequirementDetail,
} from "../utils/calculator/nokkelhulletEvaluation";
import { CLAIMS_CONFIG } from "../utils/calculator/ClaimResult";
import {
  CLAIMS_BY_NAME,
  buildClaimStatistic,
  buildClaimDetailText,
  translateSubstanceName,
  getVisibleHealthClaims,
} from "../utils/calculator/nutritionResultHelpers";
import { loadResultatDetaljer } from "../utils/calculator/resultatDetaljerStorage";
import keyholeLogo from "../assets/img/new_resized_image_1.png";
import efsaLogoGreen from "../assets/img/efsaLogoGreen.png";
import efsaLogo from "../assets/img/efsaLogo.png";

const StatBox = ({ passed, title, statLine, children }) => {
  const color = passed ? "#0f5132" : "#343a40";
  const bg = passed ? "#f0faf1" : "#fafafa";

  return (
    <div
      className="rounded p-4 d-flex flex-column"
      style={{ backgroundColor: bg, color }}
    >
      <div className="d-flex align-items-start gap-2">
        <span
          className={`d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ${passed ? "bg-success" : "bg-danger"}`}
          style={{ width: "1.5rem", height: "1.5rem" }}
        >
          <i
            className={`bi ${passed ? "bi-check-lg" : "bi-x-lg"} text-white`}
            style={{ fontSize: "0.75rem" }}
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

const SatisfiedAccordion = ({ label, items, renderItem, logo }) => {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  return (
    <div
      className="rounded px-4 py-3 satisfied-accordion-toggle"
      style={{
        gridColumn: "1 / -1",
        cursor: "pointer",
        backgroundColor: "#f8f9fa",
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
        <i
          className={`bi bi-chevron-down resultat-accordion-chevron ${expanded ? "is-open" : ""}`}
        />
      </div>
      {expanded && (
        <div className="mt-3 satisfied-accordion-grid resultat-accordion-content">
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
        <i
          className={`bi bi-chevron-down resultat-accordion-chevron ${open ? "is-open" : ""}`}
        />
      </div>
      {open && (
        <div className="px-4 pb-3 resultat-accordion-content">
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
      {(claim.vilkaarForBruk || claim.vilkaarOgBegrensninger) && (
        <MerkingstekstAccordion
          text={[claim.vilkaarForBruk, claim.vilkaarOgBegrensninger]
            .filter(Boolean)
            .join("\n\n")}
        />
      )}
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

const SectionHeading = ({ logo, title }) => (
  <h2 className="fs-5 fw-bold mb-3 d-flex align-items-center">
    <img
      src={logo}
      alt={title}
      style={{ width: "2.25rem", height: "auto", marginRight: "0.75rem" }}
    />
    {title}
  </h2>
);

const EmptySection = ({ title, logo }) => (
  <div>
    <SectionHeading logo={logo} title={title} />
    <p className="text-muted mb-0">
      Ingen resultatdata funnet. Åpne denne siden via "Se full
      beskrivelse"-lenken fra et resultat i kalkulatoren.
    </p>
  </div>
);

const NokkelhulletDetail = ({ data }) => {
  const { category, nutrition, hasNokkelhullet } = data;
  const requirements = evaluateNokkelhulletRequirements(category, nutrition);
  const passed = hasNokkelhullet === true;
  const failed = hasNokkelhullet === false;
  const failedReqs = requirements.filter((r) => !r.passed);
  const passedReqs = requirements.filter((r) => r.passed);
  const passedFraction =
    requirements.length > 0
      ? (passedReqs.length / requirements.length) * 100
      : 0;
  return (
    <div>
      <SectionHeading logo={keyholeLogo} title="Nøkkelhullet" />
      <div className="rounded bg-white detail-grid">
        <div
          className="px-3 py-4 rounded"
          style={{
            backgroundColor: passed ? "#0f5132" : "#fafafa",
            color: passed ? "#f0faf1" : "#343a40",
          }}
        >
          {requirements.length === 0 ? (
            <p className="mb-0 px-2">
              Det finnes ingen spesifikke krav til næringsinnhold for denne
              kategorien.
            </p>
          ) : (
            <div className="px-2">
              <div className="mb-2">
                <span className="fw-bold">{Math.round(passedFraction)}%</span>{" "}
                <span style={{ opacity: 0.85 }}>Nokkelhullet krav oppfylt</span>
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
                  Produktet oppfyller ikke <strong>{failedReqs.length}</strong>{" "}
                  av <strong>{requirements.length}</strong> krav for
                  Nøkkelhullet i denne kategorien.
                </p>
              )}
            </div>
          )}
        </div>

        {(failedReqs.length > 0 ? failedReqs : passedReqs).map((req) => (
          <StatBox key={req.key} passed={req.passed} title={req.nutrient}>
            {buildRequirementDetail(req)}
          </StatBox>
        ))}

        {failedReqs.length > 0 && (
          <SatisfiedAccordion
            label="Krav som er oppfylt"
            logo={keyholeLogo}
            items={passedReqs}
            renderItem={(req) => (
              <>
                <div>
                  <span className="fw-bold">{req.nutrient}</span>
                </div>
                <div>{buildRequirementDetail(req)}</div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

const EfsaNutritionDetail = ({ data }) => {
  const { nutrition, efsaNutritionClaims } = data;
  const metNames = new Set(efsaNutritionClaims || []);
  const claims = Object.entries(CLAIMS_CONFIG)
    .map(([, cfg]) => ({
      name: cfg.name,
      cfg: CLAIMS_BY_NAME[cfg.name],
      met: metNames.has(cfg.name),
    }))
    .filter((c) => c.cfg);

  const unmetClaims = claims.filter((c) => !c.met);
  const metClaims = claims.filter((c) => c.met);
  const metCount = metClaims.length;
  const metFraction = claims.length > 0 ? (metCount / claims.length) * 100 : 0;
  const efsaOverallPassed = unmetClaims.length === 0;
  const leftColor = efsaOverallPassed ? "#f0faf1" : "#343a40";
  const leftBg = efsaOverallPassed ? "#0f5132" : "#fafafa";

  return (
    <div>
      <SectionHeading logo={efsaLogoGreen} title="EFSA Ernæringspåstander" />
      <div className="rounded bg-white detail-grid">
        <div
          className="px-3 py-4 rounded"
          style={{ backgroundColor: leftBg, color: leftColor }}
        >
          {claims.length === 0 ? (
            <p className="mb-0 px-2">
              Ingen EFSA-ernæringspåstander er mulige for denne kategorien.
            </p>
          ) : (
            <div className="px-2">
              <div className="mb-2">
                <span className="fw-bold">{Math.round(metFraction)}%</span>{" "}
                <span style={{ opacity: 0.85 }}>
                  EFSA-ernæringspåstander oppfylt
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
                  EFSA-ernæringspåstander.
                </p>
              ) : (
                <p className="mb-0">
                  Produktet oppfyller <strong>{metCount}</strong> av{" "}
                  <strong>{claims.length}</strong> mulige
                  EFSA-ernæringspåstander.
                </p>
              )}
            </div>
          )}
        </div>

        {(unmetClaims.length > 0 ? unmetClaims : metClaims).map(
          ({ name, cfg, met }) => {
            const statistic = buildClaimStatistic(cfg.key, nutrition);
            return (
              <StatBox key={name} passed={met} title={cfg.name}>
                {statistic ? `${statistic}. ` : ""}
                {buildClaimDetailText(cfg, met)}
              </StatBox>
            );
          },
        )}

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
                  </div>
                  <div>
                    {statistic ? `${statistic}. ` : ""}
                    {buildClaimDetailText(cfg, met)}
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

const EfsaHealthDetail = ({ data }) => {
  const visibleClaims = getVisibleHealthClaims(data);
  const groups = visibleClaims.reduce((acc, claim) => {
    const key = translateSubstanceName(claim.nutrient || "Ukjent");
    if (!acc[key]) acc[key] = [];
    acc[key].push(claim);
    return acc;
  }, {});

  return (
    <div>
      <SectionHeading logo={efsaLogo} title="EFSA Helsepåstander" />
      {visibleClaims.length === 0 ? (
        <p className="text-muted mb-0">
          Ingen EFSA-helsepåstander kan foreløpig utledes fra kildene som er
          lagt til.
        </p>
      ) : (
        <div className="d-flex flex-column gap-4">
          {Object.entries(groups).map(([nutrient, groupClaims]) => (
            <StatBox key={nutrient} passed title={nutrient}>
              <p className="mb-3">
                {groupClaims[0]?.amount ? `${groupClaims[0].amount}. ` : ""}
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

// Single page covering all three old-calculator result boxes — every "Se full
// beskrivelse" link points here. Each link writes its section's real result
// data to localStorage right before opening this page in a new tab (see
// resultatDetaljerStorage.ts), so the sections below can render the exact
// claims/requirements the user was looking at, not a generic reference list.
const ResultatDetaljer = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!token) {
      setData({});
      return undefined;
    }

    setData(loadResultatDetaljer(token) || {});

    // The calculator writes a fresh result under this same token on every
    // Beregn (see NutritionResult.jsx's old-calculator variant) — if this tab
    // is already open when that happens in another tab, the "storage" event
    // fires here (it never fires in the tab that made the write) so this
    // page updates immediately instead of only reflecting whatever was
    // current on load.
    const onStorage = (e) => {
      if (e.key && e.key !== `resultatDetaljer:${token}`) return;
      setData(loadResultatDetaljer(token) || {});
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [token]);

  if (!data) return null;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container py-5" style={{ maxWidth: "900px" }}>
        <div className="mb-3">
          <h1 className="fs-2 fw-bold mb-2">Resultatdetaljer</h1>
          <p className="text-muted mb-0">
            Full oversikt over kravene og påstandene fra beregningen du kom fra.
          </p>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="bg-white rounded p-4">
            {data.nokkelhullet ? (
              <NokkelhulletDetail data={data.nokkelhullet} />
            ) : (
              <EmptySection title="Nøkkelhullet" logo={keyholeLogo} />
            )}
          </div>
          <div className="bg-white p-4">
            {data.efsaNutrition ? (
              <EfsaNutritionDetail data={data.efsaNutrition} />
            ) : (
              <EmptySection
                title="EFSA Ernæringspåstander"
                logo={efsaLogoGreen}
              />
            )}
          </div>
          <div className="bg-white p-4 ">
            {data.efsaHealth ? (
              <EfsaHealthDetail data={data.efsaHealth} />
            ) : (
              <EmptySection title="EFSA Helsepåstander" logo={efsaLogo} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultatDetaljer;
