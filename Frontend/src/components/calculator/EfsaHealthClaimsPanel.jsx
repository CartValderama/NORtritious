import React from "react";
import Tooltip from "@mui/material/Tooltip";
import CustomSelect from "../../CustomSelect";
import PanelBox from "../../PanelBox";
import LabeledUnitInput from "../../LabeledUnitInput";
import RemovablePill from "../../RemovablePill";
import Button from "../../Button";
import WarningAlert from "../../WarningAlert";
import {
  OTHER_SUBSTANCE_OPTIONS,
  substanceRequiresPortionSize,
} from "../../../utils/calculator/otherSubstanceOptions";
import { useKildePicker } from "../../../hooks/calculator/useKildePicker";
import { useCalculatorFormStore } from "../../../stores/calculatorFormStore";
import { useScrollIntoViewOnOpen } from "../../../hooks/useScrollIntoViewOnOpen";

const EfsaHealthClaimsPanel = () => {
  const isOpen = useCalculatorFormStore((s) => s.showHealthClaimsPanel);
  const foodType = useCalculatorFormStore((s) => s.foodType);
  const portionSizeUnit = foodType === "liquid" ? "ml" : "g";
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
  } = useKildePicker();

  useScrollIntoViewOnOpen("efsa-health-panel", isOpen);

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
                title="Dette feltet er nyttig for påstander som krever en oppgitt porsjonsstørrelse (f.eks. beta-glukaner og blodsukkerrespons). Å la det stå tomt påvirker ikke andre beregninger."
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
                type="number"
                min="0"
                className="form-control"
                style={{ minWidth: 0 }}
                value={portionSize}
                onChange={(e) => setEfsaField("portionSize", e.target.value)}
                placeholder="f.eks. 100"
              />
              <span className="input-group-text">{portionSizeUnit}</span>
            </div>
          </div>
        </div>

        <div className="d-grid gap-4 align-items-end new-field-grid">
          <div style={{ minWidth: 0 }}>
            <label
              className="form-label d-block new-label-indent"
              style={{ marginBottom: "0.5rem" }}
            >
              Velg kilde (g/100g)
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
                control: (base) => ({ ...base, minHeight: "47px" }),
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
              unit="g"
              placeholder="f.eks. 5"
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
            style={{ whiteSpace: "nowrap", height: "47px" }}
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

        {substanceRequiresPortionSize(newSubstance?.value) && (
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
              const label =
                OTHER_SUBSTANCE_OPTIONS.find((o) => o.value === s.name)
                  ?.label || s.name;
              return (
                <RemovablePill
                  key={s.name}
                  label={`${label}: ${s.amount}g`}
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
