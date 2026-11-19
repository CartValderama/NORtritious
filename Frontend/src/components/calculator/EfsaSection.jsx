import React from "react";
import { formatNoNumber } from "../../utils/calculator/nutritionFormFields";
import { NUTRITION_CLAIMS_SOURCE } from "../../utils/calculator/lovdataLinks";
import { DEFAULT_PAGE_SIZE, usePagination } from "../../hooks/usePagination";
import ClaimGrid from "./ClaimGrid";
import ResultSectionFooter from "./ResultSectionFooter";

// Which claims apply and whether each was met both come from the response now. The backend
// already decided both, and deriving the list here a second time meant the category gate and
// the solid/liquid gate had to be kept identical in two places.
const EfsaSection = ({ result }) => {
  const claims = result.efsaNutritionClaimResults || [];
  // Paged, because a kategori can offer more påstander than fit under one heading. The
  // empty-state message still reads the whole list, since the question it answers is
  // whether any påstand is possible at all and not whether this page holds one.
  const { pageItems, pager } = usePagination(claims, DEFAULT_PAGE_SIZE, result);

  return (
    <>
      <ClaimGrid
        isEmpty={claims.length === 0}
        emptyMessage="Ingen EFSA-ernæringspåstander er mulige for denne kategorien."
      >
        {pageItems.map(({ key, label, passed, explanation, actualValue, thresholdUnit }, i) => {
          // Counted within the page, not within the whole list. The borders draw the grid
          // the reader is looking at, and the last card on a page is at the edge of it
          // whatever follows on the next one.
          const isLastInRow = i % 2 === 1 || i === pageItems.length - 1;
          const rows = Math.ceil(pageItems.length / 2);
          const isLastRow = i >= (rows - 1) * 2;

          return (
            <div
              key={key}
              className={`claim-grid-item p-4 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
              style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
            >
              <p
                className={`mb-2 fw-bold  d-flex align-items-center gap-2 ${passed ? "text-success-emphasis" : "text-danger-emphasis"}`}
              >
                <i
                  className={`bi ${passed ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                  style={{ color: passed ? "#198754" : "#dc3545", fontSize: "1rem" }}
                />
                {label}
              </p>
              <p className="mb-0" style={{ color: passed ? "#062814" : "#3b0c0f" }}>
                {/* No figure means none could be worked out, so the card says nothing about
                    what the product contains and leaves the explanation to say why. */}
                {typeof actualValue === "number" &&
                  `Produktet inneholder ${formatNoNumber(actualValue)} ${thresholdUnit}. `}
                {explanation}
              </p>
            </div>
          );
        })}
      </ClaimGrid>

      {/* The vilkår behind every one of these påstander sit in the same vedlegg, so the
          link belongs to the section and not to each card. Shown even when no påstand is
          possible for the kategori, because that verdict is the one a reader is most likely
          to want to check against the text. */}
      <ResultSectionFooter
        source={NUTRITION_CLAIMS_SOURCE}
        pager={pager}
        pagerLabel="Sider med ernæringspåstander"
      />
    </>
  );
};

export default EfsaSection;
