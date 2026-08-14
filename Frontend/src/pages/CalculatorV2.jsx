import React, { useState } from "react";
import "../css/Calculator.css";
import * as ProductService from "../services/productService";
import ProductButtons from "../components/calculator/ProductButtons";
import OldNutritionForm from "../components/calculator/old/OldNutritionForm";
import OldNutritionResult from "../components/calculator/old/OldNutritionResult";
import EfsaHealthClaimsPanel from "../components/calculator/old/OldEfsaHealthClaimsPanel";
import ProductInfoSection from "../components/calculator/ProductInfoSection";
import { useCalculatorState } from "../utils/calculator/useCalculatorState";
import efsaLogo from "../assets/img/efsaLogo.png";

// v2 — same underlying hook/backend logic as Calculator.jsx, but styled after the
// pre-rewrite per-category calculator: table-based nutrition input and a two-column
// (form left, results right) layout with solid green/red result boxes, instead of the
// current card-based single-column design.
const EMPTY_EFSA_VALUES = {
  totalStarch: "",
  resistantStarch: "",
  otherSubstances: [],
  portionSize: "",
};

const CalculatorV2 = () => {
  const {
    selectsGroup,
    setSelectGroups,
    selectsProduct,
    setSelectProduct,
    selectsFragment,
    setSelectFragment,
    selectsRation,
    setSelectRation,
    categoryKey,
    productOptions,
    fragmentOptions,
    rationOptions,
    selectedImage,
    setSelectedImage,
    product,
    setProduct,
    nutrition,
    isCalculationCompleted,
    handleChange,
    handleNutritionChange,
    handleCalculationComplete,
    handleHasNokkelhullet,
    handleEfsaNutrition,
    buildSubmitPayload,
  } = useCalculatorState();

  const [foodType, setFoodType] = useState("");
  const [foodTypeError, setFoodTypeError] = useState(false);
  const [result, setResult] = useState(null);
  const [resultNutrition, setResultNutrition] = useState(null);
  const [showHealthClaimsPanel, setShowHealthClaimsPanel] = useState(false);
  const [efsaValues, setEfsaValues] = useState(EMPTY_EFSA_VALUES);
  const [efsaResetKey, setEfsaResetKey] = useState(0);

  const handleResetAll = () => {
    setEfsaValues(EMPTY_EFSA_VALUES);
    setEfsaResetKey((k) => k + 1);
    setShowHealthClaimsPanel(false);
    setResult(null);
    setResultNutrition(null);
    handleHasNokkelhullet(false);
    handleEfsaNutrition(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = "";
    if (selectedImage) {
      try {
        imageUrl = await ProductService.uploadProductImage(selectedImage);
      } catch (error) {
        console.error(
          "Image upload failed:",
          error.response?.data || error.message,
        );
        alert("Feil ved opplasting av bilde.");
        return;
      }
    }

    const payload = buildSubmitPayload(result);
    const updatedProduct = {
      ...product,
      ...payload,
      group: `<strong>Matgruppe:</strong> ${selectsGroup}`,
      imageUrl,
    };

    try {
      await ProductService.createProduct(updatedProduct);
      alert(
        "Resept er nå lagret for dette produktet!\nDu kan behandle produktet på produkt-siden.",
      );
    } catch (error) {
      console.error(
        "Error saving product:",
        error.response ? error.response.data : error.message,
      );
      alert(
        "Noe gikk galt.\nReseptet er ikke lagret.\nSjekk at du er logget inn som matprodusent.",
      );
      if (imageUrl) {
        try {
          await ProductService.deleteProductImage(imageUrl);
        } catch (deleteError) {
          console.error(
            "Failed to delete orphaned image:",
            deleteError.response?.data || deleteError.message,
          );
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="calculator d-flex flex-column gap-5 pb-5">
        <div className="row justify-content-between">
          <div className="col-lg-9">
            <h1>Mulige ernærings- og helsepåstander</h1>
            <p className="mt-2">
              Fyll inn ernæringsverdiene og trykk "beregn" for å se resultatet.
              Hold musepekeren over et feilikon for å se hvorfor et krav ikke er
              oppfylt. EFSA-påstander genereres automatisk basert på verdiene og
              eventuelle tilleggsstoffer du legger til.
            </p>
          </div>

          <ProductButtons
            showSubmitButton={isCalculationCompleted}
            onSubmit={handleSubmit}
          />
        </div>

        <ProductInfoSection
          product={product}
          setProduct={setProduct}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handleChange={handleChange}
          selectsGroup={selectsGroup}
          setSelectGroups={setSelectGroups}
          setSelectProduct={setSelectProduct}
          setSelectFragment={setSelectFragment}
          setSelectRation={setSelectRation}
          productOptions={productOptions}
          fragmentOptions={fragmentOptions}
          rationOptions={rationOptions}
          foodTypeError={foodTypeError}
          onFoodTypeChange={setFoodType}
          onCategoryChange={() => {
            setResult(null);
            setResultNutrition(null);
          }}
          onResetHealthClaimsPanel={() => setShowHealthClaimsPanel(false)}
        />

        {/* ── Old-design layout: form left, results right, side by side when there's
            room — plain flexbox instead of the row/col grid, since this is only ever
            two items and flex-wrap already gives us "stack on narrow, side by side
            otherwise" for free. One overlay message shared between the form/results
            skeletons instead of each showing its own, since both can be empty at the
            same time. ──────────────────────────────────────────────────────────── */}
        <div className="position-relative">
        <div className="d-flex flex-wrap gap-5 align-items-start">
          <div className="v2-split-col">
            <OldNutritionForm
              key={`${selectsGroup}|${selectsProduct}|${selectsFragment}|${selectsRation}`}
              category={categoryKey}
              foodType={foodType}
              onFoodTypeErrorChange={setFoodTypeError}
              onNutritionChange={handleNutritionChange}
              onResult={(data, nutritionSnapshot) => {
                setResult(data);
                setResultNutrition(nutritionSnapshot);
              }}
              onCalculationComplete={handleCalculationComplete}
              onNokkelhulletChange={handleHasNokkelhullet}
              onEfsaNutritionChange={handleEfsaNutrition}
              totalStarch={efsaValues.totalStarch}
              resistantStarch={efsaValues.resistantStarch}
              otherSubstances={efsaValues.otherSubstances}
              portionSize={efsaValues.portionSize}
              onResetAll={handleResetAll}
            >
              <button
                type="button"
                className={`btn ${showHealthClaimsPanel ? "btn-light-primary" : "btn-light-secondary"} w-100 mt-3 py-2 d-flex align-items-center justify-content-center gap-2`}
                onClick={() => setShowHealthClaimsPanel((v) => !v)}
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
              {showHealthClaimsPanel && (
                <EfsaHealthClaimsPanel
                  key={efsaResetKey}
                  kostfiber={Number(nutrition.kostfiber) || 0}
                  onValuesChange={setEfsaValues}
                />
              )}
            </OldNutritionForm>
          </div>

          <div className="v2-split-col">
            <OldNutritionResult
              result={result}
              category={categoryKey}
              nutrition={resultNutrition}
              foodType={foodType}
            />
          </div>
        </div>

        {(!categoryKey || !foodType) && (
          <div
            className="position-absolute top-0 start-50 translate-middle-x mt-5 rounded shadow-sm bg-white px-5 py-4 text-center"
            style={{ maxWidth: "90%", zIndex: 1 }}
          >
            <p className="fw-medium fs-5 text-muted mb-0">
              {!categoryKey
                ? "Velg en matkategori for å starte beregningen"
                : "Velg type matvare for å starte beregningen"}
            </p>
          </div>
        )}
        </div>
      </div>
    </form>
  );
};

export default CalculatorV2;
