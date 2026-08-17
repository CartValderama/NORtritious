import React, { useState, useEffect } from "react";
import NutritionFieldTable from "./NutritionFieldTable";
import {
  EMPTY_NUTRITION,
  ZERO_SUGAR_CATEGORIES,
  isFieldRelevant,
  NUTRITION_FIELDS,
} from "../../../utils/calculator/nutritionFormFields";
import { calculateNutrition } from "../../../services/calculatorService";
import { getSampleNutrition } from "../../../utils/calculator/sampleNutritionGenerator";

// Old-design counterpart to NutritionForm.jsx — same calculation call and validation,
// table-based field input (NutritionFieldTable) instead of the card grid, and
// old-style Beregn/Nullstill buttons sitting directly under the table.
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
  onResetAll,
  children,
}) => {
  const [nutrition, setNutrition] = useState(EMPTY_NUTRITION);
  const [energyUnit, setEnergyUnit] = useState("energikcal");
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  // Floating "scroll to top" button — only shown once the page has actually
  // scrolled down a bit, so it doesn't just sit there uselessly at the top.
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReset = () => {
    setNutrition(EMPTY_NUTRITION);
    setEnergyUnit("energikcal");
    setErrors({});
    setCalculating(false);
    setCalculatedNutrition(null);
    onNutritionChange?.(EMPTY_NUTRITION);
    onResetAll?.();
  };

  if (!category || !foodType) {
    return null;
  }

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

  const hasInput = Object.values(nutrition).some((value) => value !== "");

  return (
    <div>
      <h2 className="mb-2">Næringsinnhold</h2>
      <p className="text-muted mb-4">
        Fyll inn energi og næringsstoffer per 100 g/ml. Ønsker du også å beregne
        helsepåstander, kan du åpne "Beregn for helsepåstander" under.
      </p>

      <NutritionFieldTable
        category={category}
        nutrition={nutrition}
        energyUnit={energyUnit}
        onEnergyUnitChange={setEnergyUnit}
        errors={errors}
        calculatedNutrition={calculatedNutrition}
        onFieldChange={handleFieldChange}
      />

      {/* Slot for the EFSA Helsepåstander panel (Stivelse / Kilde til Annet / Porsjonsstørrelse) */}
      {children}

      {Object.keys(errors).length > 0 && (
        <div className="alert alert-warning border-0 py-2">
          Fyll inn alle næringsverdier (0 eller høyere) og velg mattype.
        </div>
      )}

      <div className="col-12 d-flex gap-2 mt-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCalculate}
          disabled={calculating}
        >
          {calculating ? "Beregner…" : "Beregn"}
        </button>
        {hasInput && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleReset}
          >
            Nullstill
          </button>
        )}
      </div>

      {/* Floating buttons — fixed to the viewport corner instead of sitting
          inline in the form, so they stay reachable regardless of scroll. */}
      <div
        className="d-flex flex-column gap-2"
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1030 }}
      >
        {showScrollTop && (
          <button
            type="button"
            className="btn btn-dark rounded-circle shadow d-flex align-items-center justify-content-center"
            style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll til toppen"
          >
            <i className="bi bi-arrow-up" />
          </button>
        )}
        <button
          type="button"
          className="btn btn-success rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
          onClick={() => handleFillSample("pass")}
          title="Fyll ut eksempeldata (grønt/nøytralt resultat)"
        >
          <i className="bi bi-magic" />
        </button>
      </div>
    </div>
  );
};

export default NutritionForm;
