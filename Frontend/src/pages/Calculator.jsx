import React, { useState } from "react";
import "../css/Calculator.css";
import * as ProductService from "../services/productService";
import ProductButtons from "../components/calculator/ProductButtons";
import NutritionForm from "../components/calculator/NutritionForm";
import NutritionResult from "../components/calculator/NutritionResult";
import EfsaHealthClaimsPanel from "../components/calculator/EfsaHealthClaimsPanel";
import ProductInfoSection from "../components/calculator/ProductInfoSection";
import { useCalculatorState } from "../utils/calculator/useCalculatorState";

const EMPTY_EFSA_VALUES = {
  totalStarch: "",
  resistantStarch: "",
  otherSubstances: [],
  portionSize: "",
};

const Calculator = () => {
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
  // Values reported up from EfsaHealthClaimsPanel (which owns the actual state/logic
  // for Stivelse and Kilde til Annet) — this is all NutritionForm's calculation
  // payload needs from that panel.
  const [efsaValues, setEfsaValues] = useState(EMPTY_EFSA_VALUES);
  // Bumped on Nullstill to force EfsaHealthClaimsPanel to remount with fresh state
  // (same key-based reset pattern NutritionForm already uses for category changes).
  const [efsaResetKey, setEfsaResetKey] = useState(0);

  // Clears every EFSA-panel field (Stivelse, Kilde til Annet, Porsjonsstørrelse) and any
  // stale calculation result — called from NutritionForm's "Nullstill" button, alongside
  // its own reset of the normal nutrition fields.
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

        {/* ── Top: product info ─────────────────────────────────────────────── */}
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

        {/* ── Bottom: nutrition form, then EFSA conditions stacked below ───── */}
        <div className="row g-4 align-items-start">
          <div className="col-12">
            <NutritionForm
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
              onShowHealthClaimsPanel={() =>
                setShowHealthClaimsPanel((v) => !v)
              }
              showHealthClaimsPanel={showHealthClaimsPanel}
              totalStarch={efsaValues.totalStarch}
              resistantStarch={efsaValues.resistantStarch}
              otherSubstances={efsaValues.otherSubstances}
              portionSize={efsaValues.portionSize}
              onResetAll={handleResetAll}
            >
              {showHealthClaimsPanel && (
                <EfsaHealthClaimsPanel
                  key={efsaResetKey}
                  kostfiber={Number(nutrition.kostfiber) || 0}
                  onValuesChange={setEfsaValues}
                />
              )}
            </NutritionForm>
          </div>
        </div>

        <div id="nutrition-result">
          <NutritionResult
            result={result}
            category={categoryKey}
            nutrition={resultNutrition}
            foodType={foodType}
            showHealthClaimsPanel={showHealthClaimsPanel}
          />
        </div>
      </div>
    </form>
  );
};

export default Calculator;
