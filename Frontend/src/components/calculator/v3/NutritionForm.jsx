import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import efsaLogo from "../../../assets/img/efsaLogo.png";
import NutritionFieldColumn from "./NutritionFieldColumn";
import PanelBox from "./PanelBox";
import BsAccordionItem from "./BsAccordionItem";
import {
  NUTRITION_FIELDS,
  EMPTY_NUTRITION,
  ZERO_SUGAR_CATEGORIES,
  isFieldRelevant,
} from "../../../utils/calculator/nutritionFormFields";
import { getSampleNutrition } from "../../../utils/calculator/sampleNutritionGenerator";
import { calculateNutrition } from "../../../services/calculatorService";

const NutritionForm = ({
  category,
  foodType,
  totalStarch,
  resistantStarch,
  otherSubstances,
  portionSize,
  onFoodTypeErrorChange,
  onNutritionChange,
  onCalculationComplete,
  onResult,
  onNokkelhulletChange,
  onEfsaNutritionChange,
  onShowHealthClaimsPanel,
  showHealthClaimsPanel,
  onResetAll,
  children,
}) => {
  const [nutrition, setNutrition] = useState(EMPTY_NUTRITION);
  const [energyUnit, setEnergyUnit] = useState("energikcal");
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);

  const handleReset = () => {
    setNutrition(EMPTY_NUTRITION);
    setEnergyUnit("energikcal");
    setErrors({});
    setCalculating(false);
    setHasResult(false);
    setCalculatedNutrition(null);
    onNutritionChange?.(EMPTY_NUTRITION);
    onResetAll?.();
  };

  if (!category || !foodType) {
    return (
      <PanelBox className="w-100 flex-grow-1 position-relative">
        <div className="position-absolute top-50 start-50 translate-middle rounded shadow-sm bg-white px-4 py-3 text-center" style={{ maxWidth: "90%" }}>
          <p className="text-muted mb-0">
            {!category
              ? "Velg en matkategori for å starte beregningen"
              : "Velg type matvare for å starte beregningen"}
          </p>
        </div>
      </PanelBox>
    );
  }

  const hasInput = Object.values(nutrition).some((value) => value !== "");

  const handleFillSample = (outcome) => {
    const sample = getSampleNutrition(category, outcome);
    setNutrition(sample);
    setEnergyUnit("energikcal");
    onNutritionChange?.(sample);
  };

  const handleFieldChange = (key, value) => {
    const updated = { ...nutrition, [key]: value };
    setNutrition(updated);
    onNutritionChange?.(updated);
  };

  const validate = () => {
    const errs = {};
    if (!foodType) errs.foodType = true;
    onFoodTypeErrorChange?.(!foodType);
    const energyVal =
      energyUnit === "energikcal" ? nutrition.energikcal : nutrition.energikj;
    if (energyVal === "" || Number(energyVal) <= 0) errs.energy = true;
    NUTRITION_FIELDS.filter(({ key }) =>
      isFieldRelevant(key, category),
    ).forEach(({ key }) => {
      if (nutrition[key] === "" || Number(nutrition[key]) < 0) errs[key] = true;
    });
    if (Number(resistantStarch) > Number(totalStarch))
      errs.resistantStarch = true;
    return errs;
  };

  const handleCalculate = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCalculating(true);

    try {
      const data = await calculateNutrition({
        category,
        foodType,
        energyUnit,
        portionSize: Number(portionSize) || 0,
        nutrition: {
          energyKcal: Number(nutrition.energikcal) || 0,
          energyKj: Number(nutrition.energikj) || 0,
          fat: Number(nutrition.fett),
          saturatedFat: Number(nutrition.mettede),
          transFat: Number(nutrition.transfett) || 0,
          carbs: Number(nutrition.karbohydrat),
          naturalSugars: ZERO_SUGAR_CATEGORIES.has(category)
            ? 0
            : Number(nutrition.naturligSukker),
          addedSugars: ZERO_SUGAR_CATEGORIES.has(category)
            ? 0
            : Number(nutrition.hvoravSukkerarter),
          fibre: Number(nutrition.kostfiber),
          protein: Number(nutrition.protein),
          salt:
            (Number(nutrition.naturligSalt) || 0) +
            (Number(nutrition.tilsattSalt) || 0),
          addedSalt: Number(nutrition.tilsattSalt) || 0,
          totalStarch: Number(totalStarch) || 0,
          resistantStarch: Number(resistantStarch) || 0,
        },
        others: (otherSubstances || []).map((s) => ({
          name: s.name,
          amount: Number(s.amount) || 0,
        })),
      });

      onResult?.(data, nutrition);
      setHasResult(true);
      setCalculatedNutrition(nutrition);
      onCalculationComplete?.();
      onNokkelhulletChange?.(data.hasNokkelhullet === true);
      onEfsaNutritionChange?.(data.efsaNutritionClaims);
    } catch (err) {
      console.error("Calculation failed:", err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div>
      <PanelBox>
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0 fs-6">Næringsinnhold (100g/ml)</h2>
            <Tooltip
              title='Fyll inn energi og næringsstoffer per 100 g/ml. Åpne "Beregn for helsepåstander" under for helsepåstander.'
              placement="right"
              arrow
            >
              <i
                className="bi bi-info-circle text-muted"
                style={{ cursor: "help", fontSize: "1rem" }}
              />
            </Tooltip>
          </div>
          <button
            type="button"
            className="btn btn-link nullstill-btn text-primary border-0 py-1 px-2 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              visibility: hasInput ? "visible" : "hidden",
              fontSize: "1.1rem",
            }}
            onClick={handleReset}
            disabled={!hasInput}
            title="Nullstill"
          >
            <i className="bi bi-arrow-counterclockwise" />
          </button>
        </div>
        <NutritionFieldColumn
          category={category}
          nutrition={nutrition}
          energyUnit={energyUnit}
          onEnergyUnitChange={setEnergyUnit}
          errors={errors}
          calculatedNutrition={calculatedNutrition}
          onFieldChange={handleFieldChange}
        />

        {/* Full-width expand toggle for the EFSA Helsepåstander panel — same
            shared accordion shell as "Hvordan bruke kalkulatoren" (so it gets
            the same animation and correct corner clipping for free), but
            React-controlled since the open state also drives the EFSA panel
            mount and the button's own corner radius. */}
        <div style={{ marginTop: "2.25rem", marginBottom: "2.25rem" }}>
          <BsAccordionItem
            id="efsaAccordion"
            itemStyle={{ border: "1px solid #dee2e6" }}
            buttonClassName="efsa-accordion-toggle p-0 d-flex align-items-stretch justify-content-between"
            buttonStyle={
              showHealthClaimsPanel
                ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                : undefined
            }
            open={showHealthClaimsPanel}
            onToggle={onShowHealthClaimsPanel}
            header={
              <>
                <div
                  className="d-flex align-items-center gap-2 ps-3"
                  style={{ paddingTop: "0.875rem", paddingBottom: "0.875rem" }}
                >
                  <img
                    src={efsaLogo}
                    alt="EFSA"
                    style={{ width: "1.4rem", height: "auto" }}
                  />
                  {showHealthClaimsPanel
                    ? "Skjul helsepåstander"
                    : "Beregn for helsepåstander"}
                </div>
                <span
                  className="d-flex align-items-center justify-content-center px-3 efsa-accordion-icon-addon"
                  style={{
                    paddingTop: "0.875rem",
                    paddingBottom: "0.875rem",
                    borderLeft: "1px solid #dee2e6",
                  }}
                >
                  <i
                    className={`bi ${showHealthClaimsPanel ? "bi-x-lg" : "bi-plus-lg"}`}
                  />
                </span>
              </>
            }
          >
            {children}
          </BsAccordionItem>
        </div>

        {/* Validation error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-warning border-0 py-2">
            Fyll inn alle næringsverdier (0 eller høyere) og velg mattype.
          </div>
        )}

        {/* Calculate button */}
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "10px 24px", whiteSpace: "nowrap" }}
            onClick={handleCalculate}
            disabled={calculating}
          >
            {calculating ? "Beregner…" : "Beregn"}
          </button>
          {hasResult && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              style={{ padding: "10px 24px", whiteSpace: "nowrap" }}
              onClick={() =>
                document
                  .getElementById("nutrition-result")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Vis resultat
            </button>
          )}
        </div>
      </PanelBox>

      {/* Floating sample-data buttons — fixed to the viewport corner instead of
          sitting inline in the form, so they stay reachable regardless of scroll. */}
      <div
        className="d-flex flex-column gap-2"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 1030,
        }}
      >
        <button
          type="button"
          className="btn btn-success rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
          onClick={() => handleFillSample("pass")}
          title="Fyll ut eksempeldata (grønt/nøytralt resultat)"
        >
          <i className="bi bi-magic" />
        </button>
        <button
          type="button"
          className="btn btn-danger rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
          onClick={() => handleFillSample("fail")}
          title="Fyll ut eksempeldata (rødt/nøytralt resultat)"
        >
          <i className="bi bi-magic" />
        </button>
      </div>
    </div>
  );
};

export default NutritionForm;
