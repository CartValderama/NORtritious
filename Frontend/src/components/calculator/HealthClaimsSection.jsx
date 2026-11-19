import React, { useState } from "react";
import {
  stripPercentageSuffix,
  getAllHealthClaims,
  getClaimStatus,
} from "../../utils/calculator/nutritionResultHelpers";
import { DEFAULT_PAGE_SIZE, usePagination } from "../../hooks/usePagination";
import ClaimGrid from "./ClaimGrid";
import ResultSectionFooter from "./ResultSectionFooter";

// Three states, not two. "Undetermined" is for conditions the calculator deliberately
// doesn't judge (missing input, or a requirement that isn't about composition) — showing
// those in the same red as a genuine miss would claim the product fell short when it was
// never assessed.
// `button` is the same grey for all three verdicts, since every link out of a result now
// wears one chip. It was btn-light-primary on met, which had the card's two links take the
// verdict's colour, and it stays per-verdict here so that is one word away again.
const CLAIM_STYLES = {
  met: { color: "#4379d6", icon: "bi-patch-check-fill", button: "btn-light-secondary" },
  notMet: { color: "#b02a37", icon: "bi-x-circle-fill", button: "btn-light-secondary" },
  undetermined: { color: "#6c757d", icon: "bi-dash-circle-fill", button: "btn-light-secondary" },
};

// Plain click-to-toggle, no accordion styling/border — just hides the
// condition text behind a click instead of always showing it.
//
// Used for both blocks of text the register keeps per claim, which is why the label is a
// prop and the component is no longer named after one of them. The second block,
// restrictions_of_use, is not a list of things to satisfy: it holds prohibitions and
// warnings, so calling it "Vilkår for bruk" would have told the reader the wrong thing
// about what to do with it.
const ClaimTextToggle = ({ text, label, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        className="btn btn-link vilkaar-toggle p-0 fw-bold text-uppercase text-muted d-flex align-items-center gap-1"
        style={{ fontSize: "0.8rem" }}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <i className={`bi bi-caret-${open ? "up" : "down"}-fill`} />
      </button>
      {open && (
        <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.85rem" }}>
          {text}
        </p>
      )}
    </div>
  );
};

const HealthClaimsSection = ({ result }) => {
  const allClaims = getAllHealthClaims(result);
  // The longest of the three sections by a distance, since every kilde a producer adds
  // brings its own påstander with it. isEmpty still reads the whole list, because "no kilder
  // added" is a fact about the product and not about which page is open.
  const { pageItems, pager } = usePagination(allClaims, DEFAULT_PAGE_SIZE, result);

  return (
    <>
      <ClaimGrid
        isEmpty={allClaims.length === 0}
        emptyMessage="Ingen kilder er lagt til ennå."
        className="healthclaims-result-grid"
      >
        {pageItems.map((claim, i) => {
          // Counted within the page. The borders draw the grid in front of the reader, and
          // the last card on a page sits at its edge whatever follows on the next one.
          const isLastInRow = i % 2 === 1 || i === pageItems.length - 1;
          const rows = Math.ceil(pageItems.length / 2);
          const isLastRow = i >= (rows - 1) * 2;
          const status = getClaimStatus(claim.meetsRequirement);
          const style = CLAIM_STYLES[status];
          const passed = status === "met";
          const accentColor = style.color;

          return (
            <div
              key={`${claim.nutrient}|${claim.pastand}`}
              className={`claim-grid-item p-4 d-flex flex-column justify-content-between h-100 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
              style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
            >
              <div className="d-flex flex-column gap-1">
                <p
                  className="mb-2 fw-bold d-flex align-items-center gap-2"
                  style={{ color: accentColor }}
                >
                  <i
                    className={`bi ${style.icon}`}
                    style={{ color: accentColor, fontSize: "1rem" }}
                  />
                  {claim.nutrient || "Ukjent"}

                  {/* No text-lowercase. Every amount the backend sends is already in the
                      case it should be read in, and the class was there to tidy a string
                      nobody sends; what it actually did was lower-case an acronym, so
                      "0,4 g EPA og DHA per 100 g" was printed as "epa og dha". */}
                  <span className="text-muted small fw-normal ">
                    {stripPercentageSuffix(claim.amount)}
                  </span>
                </p>
                {!passed && (
                  <p className="mb-2" style={{ color: accentColor }}>
                    {claim.meetsRequirement}
                  </p>
                )}
                <p className="mb-2" style={{ color: "#132745" }}>
                  {claim.pastand}
                </p>

                {claim.vilkaarForBruk && (
                  <ClaimTextToggle
                    text={claim.vilkaarForBruk}
                    label="Vilkår for bruk"
                  />
                )}

                {/* The register's second block, restrictions_of_use. The backend has always
                    fetched, translated and sent it, and nothing drew it, so 13 of the 66
                    served claims were losing text: seven a mandatory choking warning for
                    people with swallowing difficulties, three a prohibition on foods aimed at
                    children, one a prohibition on products that are wholly sugars, plus
                    betaine's warning about intakes above 4 g.

                    Open by default, where the conditions above stay collapsed. The conditions
                    are reference text a label-maker goes looking for; these are warnings and
                    prohibitions, and one a reader has to discover behind a click is one they
                    can miss while preparing a label. */}
                {claim.vilkaarOgBegrensninger && (
                  <ClaimTextToggle
                    text={claim.vilkaarOgBegrensninger}
                    label="Begrensninger for bruk"
                    defaultOpen
                  />
                )}
              </div>

              {(claim.sourceUrl || claim.efsaQuestionUrl) && (
                <div
                  className="mt-4"
                  style={{ display: "inline-grid", gap: "0.5rem" }}
                >
                  {claim.sourceUrl && (
                    <a
                      href={claim.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${style.button} btn-sm text-start d-inline-flex align-items-center gap-2`}
                      style={{ textDecoration: "none", fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-box-arrow-up-right" style={{ flexShrink: 0 }} />
                      Les forordningen som godkjenner påstanden
                    </a>
                  )}
                  {claim.efsaQuestionUrl && (
                    <a
                      href={claim.efsaQuestionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${style.button} btn-sm text-start d-inline-flex align-items-center gap-2`}
                      style={{ textDecoration: "none", fontSize: "0.85rem" }}
                    >
                      <i className="bi bi-box-arrow-up-right" style={{ flexShrink: 0 }} />
                      {claim.efsaQuestionTitle || "Les EFSA-uttalelsen"}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </ClaimGrid>

      {/* No regulation link here. These cards already carry one each, since the register
          names the forordning that authorises the individual claim. */}
      <ResultSectionFooter pager={pager} pagerLabel="Sider med helsepåstander" />
    </>
  );
};

export default HealthClaimsSection;
