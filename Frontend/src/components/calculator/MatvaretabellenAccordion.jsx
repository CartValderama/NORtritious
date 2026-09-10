import React, { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Accordion from "../Accordion";
import Button from "../Button";
import matvaretabellenLogo from "../../assets/img/matvaretabellenLogo.svg";
import {
  formatNoNumber,
  sanitizeDecimalInput,
  toDisplayDecimal,
} from "../../utils/calculator/nutritionFormFields";
import {
  roundTo,
  shareOf,
  totalGramsOf,
} from "../../utils/calculator/importedFoodTotals";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import { useScrollIntoViewOnOpen } from "../../hooks/useScrollIntoViewOnOpen";

// The ingredients the næringsinnhold above is calculated from. Only rendered once there is
// at least one, and it opens itself when it appears, since the user just asked for it from
// the settings menu and a collapsed box would look like nothing happened.
//
// The picker modal lives in NutritionForm rather than here: this component doesn't exist
// before the first ingredient, so it can't be what opens the picker that adds it.
const MatvaretabellenAccordion = ({ onOpenPicker }) => {
  const [open, setOpen] = useState(true);
  const {
    importedFoods,
    removeImportedFood,
    setImportedFoodAmount,
    recipePanelOpenRequest,
  } = useCalculatorFormStore((s) => ({
    importedFoods: s.importedFoods,
    removeImportedFood: s.removeImportedFood,
    setImportedFoodAmount: s.setImportedFoodAmount,
    recipePanelOpenRequest: s.recipePanelOpenRequest,
  }));

  // Brings itself into view when it expands, the same way the helsepåstander panel does.
  useScrollIntoViewOnOpen("oppskrift-panel", open);

  // Somewhere else asked for this panel. Bootstrap's JS owns the collapse, and the only thing
  // it reacts to is a click on the header, so that is what this does rather than setting
  // `open` and hoping the DOM follows. Skips the click when it's already expanded, which
  // would otherwise close it — and scrolls directly in that case, since the hook above only
  // fires on the transition into open and there is no transition left to make.
  useEffect(() => {
    if (recipePanelOpenRequest === 0) return;
    const panel = document.getElementById("matvaretabellenAccordion");
    if (!panel) return;
    if (panel.querySelector(".accordion-collapse.show")) {
      panel.style.scrollMarginTop = "16px";
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      panel.querySelector(".accordion-button")?.click();
    }
  }, [recipePanelOpenRequest]);

  const total = totalGramsOf(importedFoods);

  // No bottom margin: the gap above Beregn belongs to Beregn, or it disappears with this
  // accordion whenever the recipe is empty and leaves the button crowding the panel above.
  return (
    <div>
      <Accordion
        id="matvaretabellenAccordion"
        itemClassName="rounded-2"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      >
        <Accordion.Header
          className="efsa-accordion-toggle d-flex align-items-center gap-2 px-4 py-3"
          style={
            open
              ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
              : {}
          }
        >
          <img
            src={matvaretabellenLogo}
            alt="Matvaretabellen"
            style={{
              width: "1.4rem",
              height: "auto",
              transform: open ? "rotate(360deg)" : "rotate(0deg)",
              transition: open ? "transform 0.5s ease-in-out" : "none",
            }}
          />
          {/* Mirrors "Beregn for helsepåstander" on the accordion above it: what the section
              is for, not just what it contains. */}
          <Accordion.Header.Label
            open="Skjul oppskrift"
            closed="Beregn fra oppskrift"
          />
          {/* Same count badge as the helsepåstander accordion, rather than a number in
              brackets in the label. */}
          {importedFoods.length > 0 && (
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
              style={{
                width: "1.25rem",
                height: "1.25rem",
                fontSize: "0.75rem",
                backgroundColor: "#212529",
                lineHeight: 1,
              }}
            >
              {importedFoods.length}
            </span>
          )}
        </Accordion.Header>
        <Accordion.Body>
          <div id="oppskrift-panel">
          {/* gap-4 to match the field rows in the helsepåstander panel above, so the two
              accordions have the same vertical rhythm. */}
          <div className="p-4 d-flex flex-column gap-4">
            {/* Its own row on the panel's 4-column grid, so the button keeps the width of a
                single field. Beside the list it would have been one small control alone in a
                column that only grows emptier, and it took a column's width off the names. */}
            <div className="d-grid gap-4 new-field-grid">
              <div style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <label className="form-label mb-0 new-label-indent">
                    Matvaretabellen
                  </label>
                  <Tooltip
                    title="Mattilsynets offisielle Matvaretabellen. Verdiene der er oppgitt per 100 g, og fyller ut næringsinnholdet øverst i skjemaet."
                    placement="right"
                    arrow
                  >
                    <i
                      className="bi bi-info-circle text-muted"
                      style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                    />
                  </Tooltip>
                </div>
                <Button
                  variant="outline"
                  className="justify-content-center w-100"
                  style={{
                    whiteSpace: "nowrap",
                    paddingTop: "var(--calc-field-padding-y)",
                    paddingBottom: "var(--calc-field-padding-y)",
                    lineHeight: "var(--calc-field-line-height)",
                  }}
                  onClick={onOpenPicker}
                >
                  <i className="bi bi-plus-lg" />
                  Legg til matvare
                </Button>
              </div>
            </div>

            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <label className="form-label mb-0 new-label-indent">
                  Matvarer i produktet
                </label>
                {/* Carries what the note under the list used to say, plus the part that
                    matters most: only the ratio between the amounts counts. */}
                <Tooltip
                  title="Oppskriften bestemmer næringsinnholdet per 100 g. Det er forholdet mellom mengdene som avgjør, så 900 g + 100 g gir samme resultat som 90 g + 10 g. Står mengden tom, regnes matvaren som 100 g."
                  placement="right"
                  arrow
                >
                  <i
                    className="bi bi-info-circle text-muted"
                    style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                  />
                </Tooltip>
              </div>
              {importedFoods.length === 0 && (
                <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                  Ingen matvarer lagt til. Næringsinnholdet fylles ut for hånd.
                </p>
              )}
              <div className="mvt-recipe-grid">
            {importedFoods.map((food) => (
              <div
                key={food.foodId}
                className="mvt-food-item d-flex align-items-center gap-3"
              >
                {/* Leading the row, so it lands in the same place on every row instead of
                    after an amount box whose position shifts with the column width. */}
                <button
                  type="button"
                  className="mvt-badge-remove flex-shrink-0"
                  onClick={() => removeImportedFood(food.foodId)}
                  title="Fjern matvare"
                >
                  <i className="bi bi-trash" />
                </button>

                {/* The share reads as part of the ingredient, so it sits with the name
                    rather than out by the controls. The name truncates rather than wraps:
                    half-width rows would otherwise change height with the length of
                    whatever food happens to be in them. */}
                <div
                  className="d-flex align-items-baseline gap-2 flex-grow-1"
                  style={{ minWidth: 0 }}
                >
                  <Tooltip title={food.foodName} placement="top" arrow>
                    <span className="text-truncate" style={{ minWidth: 0 }}>
                      {food.foodName}
                    </span>
                  </Tooltip>
                  <span
                    className="text-muted flex-shrink-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    ({formatNoNumber(Math.round(shareOf(food, importedFoods)))}{" "}
                    %)
                  </span>
                </div>

                <div className="input-group mvt-amount">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    style={{ minWidth: 0 }}
                    placeholder="100"
                    aria-label={`Mengde ${food.foodName}`}
                    value={toDisplayDecimal(food.amount ?? "")}
                    onChange={(e) => {
                      const sanitized = sanitizeDecimalInput(e.target.value);
                      if (sanitized !== null)
                        setImportedFoodAmount(food.foodId, sanitized);
                    }}
                  />
                  <span className="input-group-text">g</span>
                </div>
              </div>
            ))}
              </div>
            </div>

            {/* The panel stays on screen once a recipe has been used, so it has to read
                sensibly with nothing in it: an empty grid and a "Totalt: 0 g" would look
                like something had gone wrong rather than like a list waiting to be filled. */}
            {importedFoods.length > 0 && (
              <div className="d-flex justify-content-end">
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Totalt: {formatNoNumber(roundTo(total))} g
                </span>
              </div>
            )}
            </div>
          </div>
        </Accordion.Body>
      </Accordion>
    </div>
  );
};

export default MatvaretabellenAccordion;
