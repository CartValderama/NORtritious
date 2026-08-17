import React, { useState } from "react";
import efsaLogo from "../../../assets/img/efsaLogo.png";

// One claim's text + source links — doesn't show the "Påkrevd merkingstekst"
// details (vilkaarForBruk/vilkaarOgBegrensninger), an "old"-only omission.
const ClaimText = ({ claim }) => (
  <div>
    <p className="mb-0">
      <i className="bi bi-patch-check-fill text-primary me-2" />
      {claim.pastand}
    </p>
    {(claim.sourceUrl || claim.efsaQuestionUrl) && (
      <span
        className="d-block mt-3"
        style={{ opacity: 0.75, fontSize: "0.85rem" }}
      >
        {claim.sourceUrl && (
          <a
            href={claim.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            Kommisjonsforordning
          </a>
        )}
        {claim.sourceUrl && claim.efsaQuestionUrl && " & "}
        {claim.efsaQuestionUrl && (
          <a
            href={claim.efsaQuestionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            EFSA-uttalelse
          </a>
        )}
      </span>
    )}
  </div>
);

// Fake health claims, clearly labeled as such — not real data. Toggled on to
// demonstrate that omitting descriptions doesn't solve the real problem: the page
// will keep growing every time a new claim type gets added, regardless of how
// compact each individual entry is.
// 11 = average number of EFSA health claims per matkategori (counted from the
// mapping spreadsheet) — the realistic total this box should demo, so however many
// real claims already exist, only the shortfall up to 11 gets filled with dummies.
const DEMO_CLAIM_TARGET = 11;
const buildDemoClaims = (existingCount) => {
  const count = Math.max(0, DEMO_CLAIM_TARGET - existingCount);
  return Array.from({ length: count }, (_, i) => ({
    pastand: `Dummy helsepåstand ${i + 1} (demo) — dette er ikke ekte data, kun for å vise at listen vokser når flere påstander legges til.`,
  }));
};

// Old-design counterpart to HealthClaimsSection.jsx — same green/red-box + expand
// pattern as NokkelhulletResult/EfsaNutritionResult, instead of the current
// design's StatBox cards. Same underlying data/filter (only claims explicitly
// verified as "Oppfyller gitt krav" are shown) as the current design — just a
// different outer shell, and without the merkingstekst accordion.
const HealthClaimsResult = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDemoClaims, setShowDemoClaims] = useState(false);
  const allClaims = result
    ? [
        ...(result.efsaHealthClaims || []),
        ...(result.ingredientHealthClaims || []),
      ]
    : [];
  const realVisibleClaims = allClaims.filter(
    (c) => c.meetsRequirement === "Oppfyller gitt krav",
  );
  const visibleClaims = showDemoClaims
    ? [...realVisibleClaims, ...buildDemoClaims(realVisibleClaims.length)]
    : realVisibleClaims;

  const canExpand = result && visibleClaims.length > 0;

  return (
    <div
      className={
        !result
          ? "bg-secondary-subtle"
          : visibleClaims.length > 0
            ? "bg-primary-subtle"
            : "bg-secondary-subtle"
      }
      style={{ padding: "1.5em", borderRadius: "0.7em", cursor: canExpand ? "pointer" : undefined }}
      onClick={canExpand ? () => setIsExpanded((v) => !v) : undefined}
    >
      <div
        className={
          result
            ? "d-flex align-items-center mb-3"
            : "d-flex align-items-center"
        }
      >
        <img
          src={efsaLogo}
          alt="EFSA"
          style={{ width: "2.5rem", height: "auto", marginRight: "1em" }}
        />
        <h5 className="mb-0" style={{ minWidth: 0 }}>
          EFSA Helsepåstander
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
            {visibleClaims.length > 0 && (
              <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
            )}
          </div>
        )}
      </div>

      {result && (
        <>
          {visibleClaims.length === 0 ? (
            <p className="mb-0 text-muted">
              Ingen EFSA-helsepåstander kan foreløpig utledes fra kildene som er
              lagt til.
            </p>
          ) : (
            <p className="mb-0">
              Dette produktet <strong>kan</strong> bidra til{" "}
              {visibleClaims.length} helsepåstand
              {visibleClaims.length === 1 ? "" : "er"}.
            </p>
          )}
        </>
      )}

      {isExpanded && (
        <div className="mt-3 d-flex flex-column gap-2" onClick={(e) => e.stopPropagation()}>
          {visibleClaims.map((claim, i) => (
            <div
              key={i}
              className="rounded p-3"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
            >
              <ClaimText claim={claim} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthClaimsResult;
