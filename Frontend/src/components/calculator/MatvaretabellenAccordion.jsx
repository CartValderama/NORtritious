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

// The ingredients the næringsinnhold above is calculated from.
//
// The picker modal lives in NutritionForm rather than here: this panel can be hidden, so it
// can't be the only way to reach the picker that fills it.
const MatvaretabellenAccordion = ({ onOpenPicker }) => {
  const {
    importedFoods,
    removeImportedFood,
    setImportedFoodAmount,
    recipePanelOpenRequest,
    usePortionFromRecipe,
    setUsePortionFromRecipe,
  } = useCalculatorFormStore((s) => ({
    importedFoods: s.importedFoods,
    removeImportedFood: s.removeImportedFood,
    setImportedFoodAmount: s.setImportedFoodAmount,
    recipePanelOpenRequest: s.recipePanelOpenRequest,
    usePortionFromRecipe: s.usePortionFromRecipe,
    setUsePortionFromRecipe: s.setUsePortionFromRecipe,
  }));

  // Collapsed when the switch in Flere opplysninger is what put this on screen: that asked
  // for the section to be available, not to be opened and read. Open when it arrives with
  // ingredients already in it, which means the picker filled it from the settings menu and
  // the list is the thing worth seeing. Read once, at mount, because Bootstrap's JS owns
  // the collapse from then on.
  const [open, setOpen] = useState(() => importedFoods.length > 0);

  // Brings itself into view when the user expands it, the same way the helsepåstander panel
  // does, but not when it merely appears. It mounts already open, and what mounts it is a
  // switch at the top of the form, so scrolling on mount threw the page down here the moment
  // that switch was flipped. Gated on the header having been used, which the "oppskrift"
  // link's own effect below also goes through, since that works by clicking the header.
  const [headerUsed, setHeaderUsed] = useState(false);
  useScrollIntoViewOnOpen("oppskrift-panel", headerUsed && open, { block: "center" });

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
        onToggle={() => {
          setHeaderUsed(true);
          setOpen((v) => !v);
        }}
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
            <div>
              <div className="d-flex align-items-center gap-2 field-label-row">
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
                {/* At the right-hand end of the heading of the list it is the total of,
                    rather than on a line of its own under it. Still only once there is
                    something to total: the panel stays on screen after the last ingredient
                    is removed, and a "Totalt: 0 g" would read as something having gone
                    wrong rather than as a list waiting to be filled.
                    Without new-label-indent, which the heading beside it carries: that sets
                    font-weight 500, and this is a figure to glance at, not a second
                    heading. */}
                {importedFoods.length > 0 && (
                  <span
                    className="text-muted ms-auto flex-shrink-0"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Totalt: {formatNoNumber(roundTo(total))} g
                  </span>
                )}
              </div>
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

                {/* The next cell in the list rather than a control above it: adding an
                    ingredient is how the list is continued, so the button sits where the
                    ingredient it adds will appear. Dashed, and otherwise the same tile as the
                    rows it follows, so it reads as the empty slot at the end of the list and
                    not as another ingredient already in it.
                    No title: the label names the source itself now, so a tooltip repeating it
                    would say nothing the button does not already. */}
                <Button
                  variant="outline"
                  className="mvt-add-item justify-content-center"
                  onClick={onOpenPicker}
                >
                  <i className="bi bi-plus-lg" />
                  Hent mat fra Matvaretabellen
                </Button>
              </div>
            </div>

            {/* Under the list it is asked about, and above the total that answers it. The
                recipe total is a batch, not a serving: it might make one loaf or ten pots,
                and nothing in the ingredient list says which, so the connection to
                porsjonsstørrelse is only made when the user answers it here.

                Lives with the recipe rather than beside the field it fills, which is the
                same arrangement as the nutrition fields: those are written and locked from
                this panel too, and none of them carries a control of its own. */}
            {importedFoods.length > 0 && (
              <div>
                <div style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 field-label-row">
                    {/* Names the option rather than the field it fills: a heading reading
                        only "Porsjonsstørrelse" said what was affected but not that there was
                        anything to decide. */}
                    <div className="form-label mb-0 new-label-indent">
                      Porsjonsstørrelse fra oppskrift
                    </div>
                    {/* Short, because the question carries both the condition and the effect.
                        All that is left is the other branch, which a switch cannot state on
                        its face the way a Ja/Nei pair could: off is a default, not an
                        answer. */}
                    <Tooltip
                      title="Gir oppskriften flere porsjoner, la den stå av og skriv inn porsjonen selv under «Flere opplysninger»."
                      placement="right"
                      arrow
                    >
                      <i
                        className="bi bi-info-circle text-muted"
                        style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                      />
                    </Tooltip>
                  </div>
                  {/* A switch rather than the Ja/Nei pair it was, matching the other two in
                      the calculator. A real <label htmlFor> now, where the pair had to
                      borrow a span by id: there is one control to point at. */}
                  <div className="form-check form-switch form-switch-field mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="portionFromRecipe"
                      checked={usePortionFromRecipe}
                      onChange={(e) => setUsePortionFromRecipe(e.target.checked)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="portionFromRecipe"
                    >
                      Er hele oppskriften én porsjon? Totalvekten fylles da inn
                      som porsjonsstørrelse.
                    </label>
                  </div>
                </div>
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
