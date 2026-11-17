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
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import { useScrollIntoViewOnOpen } from "../../hooks/useScrollIntoViewOnOpen";

const EfsaHealthClaimsPanel = ({ schema }) => {
  const isOpen = useCalculatorFormStore((s) => s.showHealthClaimsPanel);
  const foodType = useCalculatorFormStore((s) => s.foodType);
  const portionSizeUnit = foodType === "liquid" ? "ml" : "g";
  const {
    totalStarch,
    resistantStarch,
    otherSubstances,
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
    efsaValues,
    kildeFields,
    isNutritionKilde,
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

          {/* One box per field the backend described for this kilde, which for all but
              three of them is the single "Mengde" the hook supplies as the default. The
              panel no longer knows that Stivelse takes two numbers, or that
              alfa-syklodekstrin wants the product's total starch beside its own amount. */}
          {kildeFields.map((f) =>
            f.target === "amount" ? (
              <LabeledUnitInput
                key={f.target}
                id="substanceAmount"
                label={f.label}
                unit={f.unit}
                placeholder={f.placeholder}
                value={newSubstanceAmount}
                onChange={(e) => {
                  setNewSubstanceAmount(e.target.value);
                  setSubstanceError("");
                }}
                disabled={newSubstance?.requiresKostfiber && fiberFullyUsed}
              />
            ) : (
              <LabeledUnitInput
                key={f.target}
                id={f.target}
                label={f.label}
                unit={f.unit}
                max="100"
                placeholder={f.placeholder}
                value={efsaValues[f.target] ?? ""}
                onChange={(e) => setEfsaField(f.target, e.target.value)}
              />
            ),
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

        {/* Each starch figure is a fraction of the one above it: resistant is part of the
            total, and slowly digestible is part of what is left once the resistant part is
            taken out, since resistant starch is by definition the part that is not
            digested. Checked here as well as in the verdict because a number that cannot be
            true is worth saying before Beregn rather than after. */}
        {isNutritionKilde && Number(resistantStarch) > Number(totalStarch) && (
          <div className="text-danger small mt-3">
            Resistent stivelse ({resistantStarch}g) kan ikke overstige totalt
            stivelsesinnhold ({totalStarch}g).
          </div>
        )}

        {isNutritionKilde &&
          Number(efsaValues.slowlyDigestibleStarch) >
            Number(totalStarch) - Number(resistantStarch) && (
            <div className="text-danger small mt-3">
              Langsomt fordøyelig stivelse (
              {efsaValues.slowlyDigestibleStarch}g) kan ikke overstige den
              fordøyelige stivelsen (
              {Number(totalStarch) - Number(resistantStarch)}g), altså totalt
              stivelse minus resistent stivelse.
            </div>
          )}

        {substanceError && (
          <div className="text-danger small mt-3">{substanceError}</div>
        )}

        {newSubstance?.requiresPortionSize && (
          <p className="mt-3 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
            Porsjonsstørrelsen under «Flere opplysninger» i
            produktinformasjonen trengs for å beregne fiberinnholdet denne
            fiberpåstanden er basert på.
          </p>
        )}

        {(hasStarch || otherSubstances.length > 0) && (
          <div className="d-flex flex-wrap gap-2 pt-2 mt-3">
            {hasStarch && (
              <RemovablePill
                label={`Stivelse: ${totalStarch}g totalt, ${resistantStarch || 0}g resistent${
                  efsaValues.slowlyDigestibleStarch
                    ? `, ${efsaValues.slowlyDigestibleStarch}g langsomt fordøyelig`
                    : ""
                }`}
                onRemove={() => handleRemoveSubstance("Stivelse")}
                ariaLabel="Fjern Stivelse"
              />
            )}

            {otherSubstances.map((s) => {
              const opt = byValue.get(s.name);
              const label = opt?.label ?? s.name;
              // A kilde that asked for no figure has none to show. Printing "Vann: 0 g"
              // would put a quantity on the pill that nobody typed and nothing reads.
              const pill =
                opt?.fields?.length === 0
                  ? label
                  : `${label}: ${s.amount} ${kildeUnit(opt)}`;
              return (
                <RemovablePill
                  key={s.name}
                  label={pill}
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
