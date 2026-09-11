import React, { useState, useEffect, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import efsaLogo from "../../assets/img/efsaLogo.png";
import NutritionFieldColumn from "./NutritionFieldColumn";
import MatvaretabellenAccordion from "./MatvaretabellenAccordion";
import matvaretabellenLogo from "../../assets/img/matvaretabellenLogo.svg";
import MatvaretabellenModal from "./MatvaretabellenModal";
import EfsaHealthClaimsPanel from "./EfsaHealthClaimsPanel";
import PanelBox from "../PanelBox";
import Accordion from "../Accordion";
import Button from "../Button";
import WarningAlert from "../WarningAlert";
import {
  validateNutritionForm,
  buildCalculationPayload,
} from "../../utils/calculator/nutritionFormFields";
import { getSampleNutrition } from "../../utils/calculator/sampleNutritionGenerator";
import { calculateNutrition } from "../../services/calculatorService";
import { getCategoryKey } from "../../utils/calculator/categoryOptions";
import { useCalculatorSchema } from "../../hooks/calculator/useCalculatorSchema";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import { IMPORTED_NUTRITION_FIELDS } from "../../utils/calculator/importedFoodTotals";

const NutritionForm = () => {
  const {
    selectsProduct,
    selectsFragment,
    selectsRation,
    setHasNokkelhullet,
    setHasEfsaNutrition,
    nutrition,
    setNutrition,
    setNutritionField,
    resetNutrition,
    efsaValues,
    foodType,
    setFoodTypeError,
    setCalculation,
    resetEfsaValues,
    efsaDisabled,
    setEfsaDisabled,
    showHealthClaimsPanel,
    setShowHealthClaimsPanel,
    toggleHealthClaimsPanel,
    resetToken,
    importedFoods,
    setImportedFoods,
    clearImportedFoods,
  } = useCalculatorFormStore((s) => ({
    selectsProduct: s.selectsProduct,
    selectsFragment: s.selectsFragment,
    selectsRation: s.selectsRation,
    setHasNokkelhullet: s.setHasNokkelhullet,
    setHasEfsaNutrition: s.setHasEfsaNutrition,
    nutrition: s.nutrition,
    setNutrition: s.setNutrition,
    setNutritionField: s.setNutritionField,
    resetNutrition: s.resetNutrition,
    efsaValues: s.efsaValues,
    foodType: s.foodType,
    setFoodTypeError: s.setFoodTypeError,
    setCalculation: s.setCalculation,
    resetEfsaValues: s.resetEfsaValues,
    efsaDisabled: s.efsaDisabled,
    setEfsaDisabled: s.setEfsaDisabled,
    showHealthClaimsPanel: s.showHealthClaimsPanel,
    setShowHealthClaimsPanel: s.setShowHealthClaimsPanel,
    toggleHealthClaimsPanel: s.toggleHealthClaimsPanel,
    resetToken: s.resetToken,
    importedFoods: s.importedFoods,
    setImportedFoods: s.setImportedFoods,
    clearImportedFoods: s.clearImportedFoods,
  }));
  const category = getCategoryKey(
    selectsProduct,
    selectsFragment,
    selectsRation,
  );
  // Which inputs this category needs comes from the backend, not from a local copy of the
  // rules. Empty until it arrives, so the form shows no fields rather than a guessed set.
  const schema = useCalculatorSchema(category, foodType);
  const { totalStarch, resistantStarch, otherSubstances, portionSize } =
    efsaValues;
  const kildeCount =
    (efsaValues.totalStarch ? 1 : 0) + efsaValues.otherSubstances.length;
  const [energyUnit, setEnergyUnit] = useState("energikcal");
  const [errors, setErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [calculatedNutrition, setCalculatedNutrition] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  // Lives here rather than in the accordion because the accordion isn't rendered until the
  // first ingredient exists, so it can't be what opens the picker that adds it.
  const [showMatvaretabellen, setShowMatvaretabellen] = useState(false);
  // Once a recipe has been used in this session the panel stays put, even after the last
  // ingredient is removed. Letting it vanish there meant getting back to it cost a trip
  // through the settings menu, for something the user had just been working in.
  const [recipeUsed, setRecipeUsed] = useState(false);
  useEffect(() => {
    if (importedFoods.length > 0) setRecipeUsed(true);
  }, [importedFoods.length]);

  const handleEfsaDisabledChange = (disabled) => {
    setEfsaDisabled(disabled);
    if (disabled) {
      resetEfsaValues();
      setShowHealthClaimsPanel(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showSettingsMenu) return undefined;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nutrition-settings-menu")) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettingsMenu]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setEnergyUnit("energikcal");
    setErrors({});
    setCalculating(false);
    setCalculatedNutrition(null);
    // Nullstill, disabling helsepåstander and changing category are all "start over", so the
    // recipe panel goes away with everything else rather than lingering as an empty box.
    setRecipeUsed(false);
  }, [resetToken]);

  const handleReset = () => {
    resetNutrition();
    resetEfsaValues();
    setShowHealthClaimsPanel(false);
    setCalculation(null);
    setHasNokkelhullet(false);
    setHasEfsaNutrition(null);
  };

  if (!category || !foodType) {
    return (
      <PanelBox
        className="w-100 text-center"
        style={{
          alignSelf: "flex-start",
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
        }}
      >
        <p className="mb-0">
          {!category
            ? "Velg en matkategori for å starte beregningen"
            : "Velg type matvare for å starte beregningen"}
        </p>
      </PanelBox>
    );
  }

  const hasInput = Object.values(nutrition).some((value) => value !== "");
  const hasResult = calculatedNutrition !== null;

  // While a list of matvarer is what the numbers are made of, those numbers aren't typed
  // over: a product whose stated nutrition doesn't follow from its own ingredients is
  // exactly what this tool is supposed to catch. Emptying the list hands the fields back.
  const lockedFields = importedFoods.length > 0 ? IMPORTED_NUTRITION_FIELDS : [];

  const handleFillSample = (outcome) => {
    const sample = getSampleNutrition(schema, outcome);
    clearImportedFoods();
    setNutrition(sample);
    setEnergyUnit("energikcal");
  };

  const handleFieldChange = (key, value) => {
    setNutritionField(key, value);
  };

  const handleCalculate = async () => {
    const errs = validateNutritionForm(
      foodType,
      energyUnit,
      nutrition,
      schema,
      resistantStarch,
      totalStarch,
    );
    setFoodTypeError(!foodType);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCalculating(true);

    try {
      const payload = buildCalculationPayload(
        category,
        foodType,
        energyUnit,
        portionSize,
        nutrition,
        totalStarch,
        resistantStarch,
        otherSubstances,
        schema,
      );
      const data = await calculateNutrition(payload);

      setCalculation({ data, nutrition, payload });
      setCalculatedNutrition(nutrition);
      setHasNokkelhullet(data.hasNokkelhullet === true);
      setHasEfsaNutrition(data.efsaNutritionClaims);
    } catch (err) {
      console.error("Calculation failed:", err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div
      className="nutrition-calc-fields d-flex flex-column"
      style={{ flex: "1 1 auto" }}
    >
      <PanelBox>
        <div
          className="d-flex align-items-baseline justify-content-between gap-2 mb-4 pb-3"
          style={{
            borderBottom: "1px solid #dee2e6",
            marginLeft: "-1.5rem",
            marginRight: "-1.5rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <div className="d-flex align-items-baseline gap-2">
            <h2 className="mb-0 fs-5 fw-bold">
              Næringsinnhold (
              {foodType === "solid" ? "100g" : foodType === "liquid" ? "100ml" : "100g/ml"}
              )
            </h2>
            <Tooltip
              title={`Fyll inn energi og næringsstoffer per ${foodType === "solid" ? "100 g" : foodType === "liquid" ? "100 ml" : "100 g/ml"}. Åpne "Beregn for helsepåstander" under for helsepåstander.`}
              placement="right"
              arrow
            >
              <i
                className="bi bi-info-circle text-muted ms-1"
                style={{ cursor: "help", fontSize: "1rem" }}
              />
            </Tooltip>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-content-center flex-shrink-0"
              style={{
                visibility: hasInput ? "visible" : "hidden",
                fontSize: "1.1rem",
                WebkitTextStroke: "0.5px",
              }}
              onClick={handleReset}
              disabled={!hasInput}
              title="Nullstill"
            >
              <i className="bi bi-arrow-counterclockwise" />
            </Button>

            <div className="nutrition-settings-menu position-relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="justify-content-center"
                style={{ fontSize: "1.1rem" }}
                onClick={() => setShowSettingsMenu((v) => !v)}
                title="Innstillinger"
                aria-haspopup="true"
                aria-expanded={showSettingsMenu}
              >
                <i className="bi bi-gear-fill" />
              </Button>
              {showSettingsMenu && (
                <div
                  className="rounded-2 shadow-sm"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    minWidth: "260px",
                    backgroundColor: "#fff",
                    border: "1px solid #dee2e6",
                    zIndex: 10,
                  }}
                >
                  <Button
                    variant="menuItem"
                    className="px-3 py-2"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    onClick={() => {
                      handleEfsaDisabledChange(!efsaDisabled);
                      setShowSettingsMenu(false);
                    }}
                  >
                    {/* The same logos the two accordions carry, so a menu item and the
                        section it acts on are recognisable as the same thing. Greyscaled by
                        .menu-item-icon to sit alongside the plain icons in the save menu. */}
                    <img src={efsaLogo} alt="" className="menu-item-icon" />
                    {efsaDisabled
                      ? "Aktiver helsepåstander"
                      : "Deaktiver helsepåstander"}
                  </Button>
                  <Button
                    variant="menuItem"
                    className="px-3 py-2"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    onClick={() => {
                      setShowMatvaretabellen(true);
                      setShowSettingsMenu(false);
                    }}
                  >
                    <img
                      src={matvaretabellenLogo}
                      alt=""
                      className="menu-item-icon"
                    />
                    Hent matvare fra Matvaretabellen
                  </Button>
                  <Button
                    variant="menuItem"
                    className="px-3 py-2"
                    style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    onClick={() => {
                      handleFillSample("pass");
                      setShowSettingsMenu(false);
                    }}
                  >
                    <i className="bi bi-magic" style={{ width: "1.1rem" }} />
                    Seed form
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <NutritionFieldColumn
          schema={schema}
          nutrition={nutrition}
          energyUnit={energyUnit}
          onEnergyUnitChange={setEnergyUnit}
          errors={errors}
          calculatedNutrition={calculatedNutrition}
          onFieldChange={handleFieldChange}
          lockedFields={lockedFields}
        />

        {!efsaDisabled && (
          <div style={{ marginBottom: "0.75rem" }}>
            <Accordion
              id="efsaAccordion"
              itemClassName="rounded-2"
              open={showHealthClaimsPanel}
              onToggle={toggleHealthClaimsPanel}
            >
              <Accordion.Header
                className="efsa-accordion-toggle d-flex align-items-center gap-2 px-4 py-3"
                style={{
                  ...(showHealthClaimsPanel
                    ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                    : {}),
                }}
              >
                <img
                  src={efsaLogo}
                  alt="EFSA"
                  style={{
                    width: "1.4rem",
                    height: "auto",
                    transform: showHealthClaimsPanel
                      ? "rotate(360deg)"
                      : "rotate(0deg)",
                    transition: showHealthClaimsPanel
                      ? "transform 0.5s ease-in-out"
                      : "none",
                  }}
                />
                <Accordion.Header.Label
                  open="Skjul helsepåstander"
                  closed="Beregn for helsepåstander"
                />
                {kildeCount > 0 && (
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
                    {kildeCount}
                  </span>
                )}
              </Accordion.Header>
              <Accordion.Body>
                <EfsaHealthClaimsPanel schema={schema} />
              </Accordion.Body>
            </Accordion>
          </div>
        )}

        {(importedFoods.length > 0 || recipeUsed) && (
          <MatvaretabellenAccordion
            onOpenPicker={() => setShowMatvaretabellen(true)}
          />
        )}

        <MatvaretabellenModal
          show={showMatvaretabellen}
          onHide={() => setShowMatvaretabellen(false)}
          onSelect={(foods) => {
            setImportedFoods(foods);
            setShowMatvaretabellen(false);
          }}
          alreadySelected={importedFoods}
        />

        {Object.keys(errors).length > 0 && (
          <WarningAlert
            messages="Fyll inn alle næringsverdier (0 eller høyere) og velg mattype."
            className="py-2"
          />
        )}

        {/* Owns its own gap from whatever ends up above it, so the spacing holds whether or
            not the oppskrift accordion is on screen. */}
        <div
          className="d-flex flex-wrap gap-2"
          style={{ marginTop: "2.25rem" }}
        >
          <Button
            variant="primary"
            size="default"
            style={{ whiteSpace: "nowrap" }}
            onClick={handleCalculate}
            disabled={calculating}
          >
            <i className="bi bi-calculator" />
            {calculating ? "Beregner…" : "Beregn"}
          </Button>
          {hasResult && (
            <Button
              variant="ghost"
              size="default"
              style={{ whiteSpace: "nowrap" }}
              onClick={() =>
                document
                  .getElementById("nutrition-result")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <i className="bi bi-bar-chart-fill" />
              Vis resultat
            </Button>
          )}
        </div>
      </PanelBox>

      <div
        className="d-flex flex-column gap-2"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 1030,
        }}
      >
        {showScrollTop && (
          <Button
            variant="iconCircle"
            className="justify-content-center"
            style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll til toppen"
          >
            <i className="bi bi-arrow-up" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NutritionForm;
