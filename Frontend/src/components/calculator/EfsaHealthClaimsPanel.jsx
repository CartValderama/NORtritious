import React from "react";
import Tooltip from "@mui/material/Tooltip";
import CustomSelect from "../CustomSelect";
import PanelBox from "../PanelBox";
import LabeledUnitInput from "../LabeledUnitInput";
import RemovablePill from "../RemovablePill";
import Button from "../Button";
import WarningAlert from "../WarningAlert";
import { kildeUnit, kildePlaceholder } from "../../utils/calculator/kildeOptions";
import { useKildePicker } from "../../hooks/calculator/useKildePicker";
import {
  formatNoNumber,
  sanitizeDecimalInput,
  toDisplayDecimal,
} from "../../utils/calculator/nutritionFormFields";
import { roundTo, totalGramsOf } from "../../utils/calculator/importedFoodTotals";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import { useScrollIntoViewOnOpen } from "../../hooks/useScrollIntoViewOnOpen";

const EfsaHealthClaimsPanel = ({ schema }) => {
  const isOpen = useCalculatorFormStore((s) => s.showHealthClaimsPanel);
  const foodType = useCalculatorFormStore((s) => s.foodType);
  const portionSizeUnit = foodType === "liquid" ? "ml" : "g";
  const {
    importedFoods,
    usePortionFromRecipe,
    setUsePortionFromRecipe,
    requestRecipePanelOpen,
  } = useCalculatorFormStore((s) => ({
    importedFoods: s.importedFoods,
    usePortionFromRecipe: s.usePortionFromRecipe,
    setUsePortionFromRecipe: s.setUsePortionFromRecipe,
    requestRecipePanelOpen: s.requestRecipePanelOpen,
  }));
  const recipeTotal = totalGramsOf(importedFoods);
  const {
    totalStarch,
    resistantStarch,
    otherSubstances,
    portionSize,
    kostfiber,
    setEfsaField,
    hasStarch,
    newSubstance,
    setNewSubstance,
    newSubstanceAmount,
    setNewSubstanceAmount,
    substanceError,
    setSubstanceError,
    attemptedFiberPick,
    setAttemptedFiberPick,
    hasFiberSource,
    fiberFullyUsed,
    kildeOptions,
    isStarchRatio,
    canAddSubstance,
    handleAddSubstance,
    handleRemoveSubstance,
    byValue,
  } = useKildePicker(schema);

  useScrollIntoViewOnOpen("efsa-health-panel", isOpen, { block: "center" });

  return (
    <div id="efsa-health-panel">
      <PanelBox
        className="rounded-bottom"
        rounded={false}
        border={false}
        bg="#fff"
      >
        <div className="d-grid gap-4 mb-4 new-field-grid">
          <div style={{ position: "relative" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <label
                htmlFor="portionSize"
                className="form-label mb-0 new-label-indent"
              >
                Porsjonsstørrelse
              </label>
              <Tooltip
                title="Hvor mye av det ferdige produktet som spises i én porsjon. Ikke mengden av en ingrediens, og ikke oppskriftens totalvekt. Feltet brukes av påstander som krever en oppgitt porsjonsstørrelse (f.eks. beta-glukaner og blodsukkerrespons). Å la det stå tomt påvirker ikke andre beregninger."
                placement="right"
                arrow
              >
                <i
                  className="bi bi-info-circle text-muted"
                  style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                />
              </Tooltip>
            </div>
            <div className="input-group">
              <input
                id="portionSize"
                type="text"
                inputMode="decimal"
                className="form-control"
                style={{ minWidth: 0 }}
                value={toDisplayDecimal(portionSize)}
                onChange={(e) => {
                  const sanitized = sanitizeDecimalInput(e.target.value);
                  if (sanitized !== null) setEfsaField("portionSize", sanitized);
                }}
                placeholder="f.eks. 100"
                disabled={usePortionFromRecipe}
              />
              <span className="input-group-text">{portionSizeUnit}</span>
            </div>
          </div>

          {/* Sits in the same grid as Porsjonsstørrelse, as a labelled question with its own
              control, because it is another thing being asked about the product rather than
              a modifier hanging off the field above.

              The recipe total is a batch, not a serving: it might make one loaf or ten pots,
              and nothing in the ingredient list says which. So the connection is only made
              when the user answers, never assumed. */}
          {importedFoods.length > 0 && (
            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                {/* A span rather than a <label>: htmlFor points at one control, and the
                    answer here is a pair of buttons. The group borrows it by id instead. */}
                {/* gap rather than a space between the words: new-label-indent is a flex
                    container, and flex drops a whitespace-only text node between two items. */}
                <span
                  id="portionFromRecipeLabel"
                  className="form-label mb-0 new-label-indent"
                  style={{ gap: "0.25em" }}
                >
                  Porsjon fra
                  {/* The recipe is further down the page and often collapsed, so the word
                      that names it takes you there rather than leaving you to find it. */}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={requestRecipePanelOpen}
                    title="Gå til oppskriften"
                  >
                    oppskrift
                  </button>
                </span>
                <Tooltip
                  title={`Oppskriften veier ${formatNoNumber(roundTo(recipeTotal))} ${portionSizeUnit} til sammen. Svarer du ja, brukes den vekten som porsjonsstørrelse. Svar nei hvis oppskriften gir flere porsjoner, og skriv inn én porsjon selv.`}
                  placement="right"
                  arrow
                >
                  <i
                    className="bi bi-info-circle text-muted"
                    style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                  />
                </Tooltip>
              </div>
              {/* Fills the rest of the cell so the control stays level with the input beside
                  it, whose height the .seg-toggle rule matches by formula. */}
              <div className="d-flex align-items-center flex-grow-1">
                <div
                  className="seg-toggle"
                  role="group"
                  aria-labelledby="portionFromRecipeLabel"
                >
                  <button
                    type="button"
                    className={usePortionFromRecipe ? "seg-on" : ""}
                    aria-pressed={usePortionFromRecipe}
                    onClick={() => setUsePortionFromRecipe(true)}
                  >
                    Ja
                  </button>
                  <button
                    type="button"
                    className={!usePortionFromRecipe ? "seg-on" : ""}
                    aria-pressed={!usePortionFromRecipe}
                    onClick={() => setUsePortionFromRecipe(false)}
                  >
                    Nei
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="d-grid gap-4 align-items-end new-field-grid">
          <div style={{ minWidth: 0 }}>
            <label
              className="form-label d-flex align-items-center new-label-indent"
              style={{ marginBottom: "0.5rem" }}
            >
              Velg kilde (per 100 {portionSizeUnit})
              <Tooltip
                title="Mengden gjelder per 100 g av det ferdige produktet, ikke per 100 g av ingrediensen. Har oppskriften 100 g havrekli med 10 g beta-glukan, og deigen veier 1000 g, blir det 1 g per 100 g."
                placement="right"
                arrow
              >
                <i
                  className="bi bi-info-circle text-muted ms-2"
                  style={{ cursor: "help", fontSize: "0.85rem" }}
                />
              </Tooltip>
            </label>
            <CustomSelect
              options={kildeOptions}
              placeholder="Velg kilde"
              value={newSubstance}
              onChange={(opt) => {
                setNewSubstance(opt);
                setSubstanceError("");
              }}
              onMenuOpen={() => setAttemptedFiberPick(true)}
              isDisabled={kildeOptions.length === 0}
              styles={{
                // react-select positions its placeholder and value absolutely, so the
                // control has no text flow to pad against and the box-model approach the
                // others use collapses it. A min-height off the same two tokens is the
                // closest it can get: 46,8px against their 46,4px, which is under a device
                // pixel at any scale factor.
                control: (base) => ({
                  ...base,
                  minHeight:
                    "calc(var(--calc-field-line-height) + 2 * var(--calc-field-padding-y) + 2px)",
                }),
              }}
            />
          </div>

          {isStarchRatio ? (
            <>
              <LabeledUnitInput
                id="totalStarch"
                label="Totalt stivelse"
                unit="g"
                max="100"
                placeholder="f.eks. 50"
                value={totalStarch}
                onChange={(e) => setEfsaField("totalStarch", e.target.value)}
              />
              <LabeledUnitInput
                id="resistantStarch"
                label="Herav resistent"
                unit="g"
                max="100"
                placeholder="f.eks. 10"
                value={resistantStarch}
                onChange={(e) =>
                  setEfsaField("resistantStarch", e.target.value)
                }
              />
            </>
          ) : (
            <LabeledUnitInput
              id="substanceAmount"
              label="Mengde"
              unit={kildeUnit(newSubstance)}
              placeholder={kildePlaceholder(newSubstance)}
              value={newSubstanceAmount}
              onChange={(e) => {
                setNewSubstanceAmount(e.target.value);
                setSubstanceError("");
              }}
              disabled={newSubstance?.requiresKostfiber && fiberFullyUsed}
            />
          )}

          <Button
            variant="outline"
            className="justify-content-center"
            // Sized like an input rather than to a fixed height: same vertical padding and
            // line-height, so the row lines up regardless of how the display rounds borders.
            style={{
              whiteSpace: "nowrap",
              paddingTop: "var(--calc-field-padding-y)",
              paddingBottom: "var(--calc-field-padding-y)",
              lineHeight: "var(--calc-field-line-height)",
            }}
            onClick={handleAddSubstance}
            disabled={!canAddSubstance}
            title="Legg til i beregning"
          >
            <i className="bi bi-plus-lg" />
            Legg til i beregning
          </Button>
        </div>

        {!hasFiberSource && attemptedFiberPick && (
          <p className="text-muted mb-2 mt-2" style={{ fontSize: "0.85rem" }}>
            Kostfiber i næringstabellen er satt til 0.
          </p>
        )}

        {fiberFullyUsed && (
          <WarningAlert
            size="small"
            messages={`All kostfiber (${kostfiber}g) er fordelt. Fjern en kilde for å bytte den ut.`}
            className="mb-2 mt-3"
          />
        )}

        {isStarchRatio &&
          Number(resistantStarch) > Number(totalStarch) && (
            <div className="text-danger small mt-3">
              Resistent stivelse ({resistantStarch}g) kan ikke overstige totalt
              stivelsesinnhold ({totalStarch}g).
            </div>
          )}

        {substanceError && (
          <div className="text-danger small mt-3">{substanceError}</div>
        )}

        {newSubstance?.requiresPortionSize && (
          <p className="mt-3 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
            Porsjonsstørrelsen øverst i panelet trengs for å beregne
            fiberinnholdet denne fiberpåstanden er basert på.
          </p>
        )}

        {(hasStarch || otherSubstances.length > 0) && (
          <div className="d-flex flex-wrap gap-2 pt-2 mt-3">
            {hasStarch && (
              <RemovablePill
                label={`Stivelse: ${totalStarch}g totalt, ${resistantStarch || 0}g resistent`}
                onRemove={() => handleRemoveSubstance("Stivelse")}
                ariaLabel="Fjern Stivelse"
              />
            )}

            {otherSubstances.map((s) => {
              const opt = byValue.get(s.name);
              const label = opt?.label ?? s.name;
              return (
                <RemovablePill
                  key={s.name}
                  label={`${label}: ${s.amount} ${kildeUnit(opt)}`}
                  onRemove={() => handleRemoveSubstance(s.name)}
                  ariaLabel={`Fjern ${label}`}
                />
              );
            })}
          </div>
        )}
      </PanelBox>
    </div>
  );
};

export default EfsaHealthClaimsPanel;
