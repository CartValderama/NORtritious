import React, { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import BsAccordionItem from "../components/calculator/v3/BsAccordionItem";
import "../css/Calculator.css";
import * as ProductService from "../services/productService";
import NutritionForm from "../components/calculator/v3/NutritionForm";
import NutritionResult from "../components/calculator/v3/NutritionResult";
import EfsaHealthClaimsPanel from "../components/calculator/v3/EfsaHealthClaimsPanel";
import ProductInfoSection from "../components/calculator/v3/ProductInfoSection";
import { useCalculatorState } from "../utils/calculator/useCalculatorState";

// v3 — starts as an exact copy of v1 (Calculator.jsx + its component tree, forked
// into components/calculator/v3/), so it can diverge from v1 independently, same
// pattern as v2's "old" fork. Reuses the same shared hook/backend logic either way —
// never duplicate calculation logic itself.
const EMPTY_EFSA_VALUES = {
  totalStarch: "",
  resistantStarch: "",
  otherSubstances: [],
  portionSize: "",
};

const CalculatorV3 = () => {
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
    <div className="d-flex flex-column flex-grow-1 gap-3">
      <Breadcrumb className="mb-0">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Hjem
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
          Produkter
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Kalkulator</Breadcrumb.Item>
      </Breadcrumb>

      <div className="row justify-content-between">
        <div>
          <h1>Mulige ernærings- og helsepåstander</h1>
          {/* Removed for now — replaced with a plain explanation of the tool below.
          <p className="mt-2" style={{ maxWidth: "800px" }}>
            Fyll inn ernæringsverdiene og trykk "beregn" for å se resultatet.
            Hold musepekeren over et feilikon for å se hvorfor et krav ikke er
            oppfylt. EFSA-påstander genereres automatisk basert på verdiene og
            eventuelle tilleggsstoffer du legger til.
          </p>
          */}
          <p className="mt-3 mb-1" style={{ lineHeight: 1.7 }}>
            Denne kalkulatoren hjelper deg å sjekke om et matprodukt kan merkes
            med Nøkkelhullet og hvilke EFSA-godkjente ernærings- og
            helsepåstander det kan bruke, basert på næringsinnholdet du legger
            inn.
          </p>
        </div>
      </div>

      {/* ── How to use the calculator ─────────────────────────────────────── */}
      <BsAccordionItem
        id="howToUseAccordion"
        itemClassName="rounded-4"
        itemStyle={{ backgroundColor: "#fafafa", border: "1px solid #f2f2f2" }}
        buttonClassName="fs-6 how-to-use-toggle p-4"
        header={
          <>
            <i className="bi bi-question-circle me-2" />
            Hvordan bruke kalkulatoren
          </>
        }
      >
        <div className="accordion-body p-4" style={{ backgroundColor: "#fafafa" }}>
          <ol className="mb-0 ps-0" style={{ listStyle: "none" }}>
            <li className="d-flex align-items-center gap-2 mb-2">
              <i
                className="bi bi-1-circle-fill flex-shrink-0"
                style={{ color: "#0d6efd", fontSize: "1.25rem" }}
              />
              <span>
                Velg matvaregruppe, matkategori og eventuelle
                undermatkategorier.
              </span>
            </li>
            <li className="d-flex align-items-center gap-2 mb-2">
              <i
                className="bi bi-2-circle-fill flex-shrink-0"
                style={{ color: "#0d6efd", fontSize: "1.25rem" }}
              />
              <span>Velg mattype (fast eller flytende form).</span>
            </li>
            <li className="d-flex align-items-center gap-2 mb-2">
              <i
                className="bi bi-3-circle-fill flex-shrink-0"
                style={{ color: "#0d6efd", fontSize: "1.25rem" }}
              />
              <span>Fyll inn næringsinnholdet per 100 g/ml.</span>
            </li>
            <li className="d-flex align-items-center gap-2 mb-2">
              <i
                className="bi bi-4-circle-fill flex-shrink-0"
                style={{ color: "#0d6efd", fontSize: "1.25rem" }}
              />
              <span>
                Slå på bryteren «Vil du også beregne helsepåstander?» dersom
                du også vil sjekke EFSA-påstander, og fyll inn
                tilleggsfeltene som dukker opp.
              </span>
            </li>
            <li className="d-flex align-items-center gap-2">
              <i
                className="bi bi-5-circle-fill flex-shrink-0"
                style={{ color: "#0d6efd", fontSize: "1.25rem" }}
              />
              <span>Trykk «Beregn» for å se resultatet.</span>
            </li>
          </ol>
        </div>
      </BsAccordionItem>

      {/* ── Top: product info ─────────────────────────────────────────────── */}
      <div>
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
      </div>

      {/* ── Bottom: form left, results right, stacking on narrow viewports. ─── */}
      <div className="d-flex flex-wrap flex-grow-1 gap-5">
        <div className="d-flex flex-column" style={{ flex: "1 1 auto" }}>
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
            onShowHealthClaimsPanel={() => setShowHealthClaimsPanel((v) => !v)}
            showHealthClaimsPanel={showHealthClaimsPanel}
            totalStarch={efsaValues.totalStarch}
            resistantStarch={efsaValues.resistantStarch}
            otherSubstances={efsaValues.otherSubstances}
            portionSize={efsaValues.portionSize}
            onResetAll={handleResetAll}
          >
            <EfsaHealthClaimsPanel
              key={efsaResetKey}
              isOpen={showHealthClaimsPanel}
              kostfiber={Number(nutrition.kostfiber) || 0}
              initialValues={efsaValues}
              onValuesChange={setEfsaValues}
            />
          </NutritionForm>
        </div>

        {categoryKey && foodType && (
          <div id="nutrition-result" style={{ flex: "1 1 350px", minWidth: 0 }}>
            <NutritionResult
              result={result}
              category={categoryKey}
              nutrition={resultNutrition}
              foodType={foodType}
              showHealthClaimsPanel={showHealthClaimsPanel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorV3;
