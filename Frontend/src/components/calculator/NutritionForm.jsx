import React, { useState } from "react";
import efsaLogo from "../../assets/img/efsaLogo.png";
import NutritionFieldGrid from "./NutritionFieldGrid";
import {
  NUTRITION_FIELDS,
  EMPTY_NUTRITION,
  ZERO_SUGAR_CATEGORIES,
  isFieldRelevant,
} from "../../utils/calculator/nutritionFormFields";
import { calculateNutrition } from "../../services/calculatorService";

// Shown in place of the form until the user has picked both a category and a food type.
const EmptyState = ({ message }) => (
  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted rounded p-4">
    <i className="bi bi-calculator mb-2 opacity-50" style={{ fontSize: "6rem" }} />
    <p className="mb-0 fw-medium fs-5">{message}</p>
  </div>
);

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

  if (!category) {
    return <EmptyState message="Velg en matkategori for å starte beregningen" />;
  }

  if (!foodType) {
    return <EmptyState message="Velg type matvare for å starte beregningen" />;
  }

  const hasInput = Object.values(nutrition).some((value) => value !== "");

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
      <div className="bg-white rounded">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0">Næringsinnhold</h2>
          {hasInput && (
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-1"
              onClick={handleReset}
            >
              <i className="bi bi-arrow-counterclockwise" />
              Nullstill
            </button>
          )}
        </div>
        <p className="text-muted small mb-4">
          Fyll inn energi og næringsstoffer per 100 g/ml. Hvilke felt som vises
          avhenger av valgt matkategori. Ønsker du også å beregne
          helsepåstander, kan du åpne "Beregn for helsepåstander" under.
        </p>
        <NutritionFieldGrid
          category={category}
          nutrition={nutrition}
          energyUnit={energyUnit}
          onEnergyUnitChange={setEnergyUnit}
          errors={errors}
          calculatedNutrition={calculatedNutrition}
          onFieldChange={handleFieldChange}
        />
      </div>

      {/* Full-width expand toggle for the EFSA Helsepåstander panel */}
      <button
        type="button"
        className={`btn ${showHealthClaimsPanel ? "btn-light-primary" : "btn-light-secondary"} w-100 mt-4 py-2 d-flex align-items-center justify-content-center gap-2`}
        style={
          showHealthClaimsPanel
            ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
            : undefined
        }
        onClick={onShowHealthClaimsPanel}
      >
        <img
          src={efsaLogo}
          alt="EFSA"
          style={{ width: "1.25rem", height: "auto" }}
        />
        {showHealthClaimsPanel
          ? "Skjul helsepåstander"
          : "Beregn for helsepåstander"}
        <i
          className={`bi ${showHealthClaimsPanel ? "bi-chevron-up" : "bi-chevron-down"}`}
        />
      </button>

      {/* Slot for the EFSA Helsepåstander panel — rendered between the nutrition
          fields and the Beregn button, so filling it in flows naturally into calculating. */}
      {children}

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
    </div>
  );
};

export default NutritionForm;
