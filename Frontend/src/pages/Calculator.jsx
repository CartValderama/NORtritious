import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import "../css/Calculator.css";
import NutritionForm from "../components/calculator/NutritionForm";
import NutritionResult from "../components/calculator/NutritionResult";
import ProductInfoSection from "../components/calculator/ProductInfoSection";
import CalculatorInstructions from "../components/calculator/CalculatorInstructions";
import WarningAlert from "../components/WarningAlert";
import { fetchProductById } from "../services/productService";
import { getCategoryPath } from "../utils/calculator/categoryOptions";
import { useCalculatorFormStore } from "../stores/calculatorFormStore";

// Maps a saved product's persisted nutrition columns back to the form's
// NutritionValues shape. Product.Calories doesn't record which unit it was
// entered in, so it's always restored into the kcal field (the form's
// default unit, and the one every product save uses in practice) —
// energikj isn't persisted at all, so it comes back empty. Transfett isn't
// persisted either, but defaults to "0" (not "") since the form treats a
// blank required field as invalid — an empty transfett would otherwise block
// recalculating every single edited product until the user retyped it.
const productToNutritionValues = (product) => ({
  energikj: "",
  energikcal: String(product.calories ?? ""),
  fett: String(product.fat ?? ""),
  mettede: String(product.satFat ?? ""),
  transfett: "0",
  karbohydrat: String(product.carbs ?? ""),
  sukkerarter: String(product.natSugar ?? ""),
  kostfiber: String(product.fiber ?? ""),
  protein: String(product.protein ?? ""),
  salt: String(product.salt ?? ""),
});

// Maps a saved product's persisted "Kilde til Annet"/helsepåstander panel
// columns back to EfsaPanelValues. A falsy stored value (0, unset) maps to
// "" rather than "0" — that's the panel's own blank/unused state, and
// hasStarch (useKildePicker.ts) already treats a falsy totalStarch as "no
// stivelse committed" either way, so there's no meaningful difference to
// preserve between "never used" and "used with 0".
const productToEfsaValues = (product) => {
  let otherSubstances = [];
  try {
    const parsed = JSON.parse(product.otherSubstancesJson || "[]");
    if (Array.isArray(parsed)) otherSubstances = parsed;
  } catch {
    otherSubstances = [];
  }
  return {
    totalStarch: product.totalStarch ? String(product.totalStarch) : "",
    resistantStarch: product.resistantStarch ? String(product.resistantStarch) : "",
    otherSubstances,
    portionSize: product.portionSize ? String(product.portionSize) : "",
  };
};

const Calculator = () => {
  const { productId } = useParams();
  const isEditRoute = Boolean(productId);
  const [loading, setLoading] = useState(isEditRoute);
  const [loadError, setLoadError] = useState(null);
  const [categoryNotRestored, setCategoryNotRestored] = useState(false);
  const { resetDraft, loadProductForEdit } = useCalculatorFormStore((s) => ({
    resetDraft: s.resetDraft,
    loadProductForEdit: s.loadProductForEdit,
  }));

  // rem is always relative to the root <html> element, not any local
  // container — so making every rem-sized piece of text on this page
  // (headings, Bootstrap fs-* utilities, custom CSS, all of it) shrink
  // together as the viewport narrows means responsively scaling the root
  // font-size itself, scoped to just this page via this class rather than
  // globally (see .calculator-responsive-text in Calculator.css).
  useEffect(() => {
    document.documentElement.classList.add("calculator-responsive-text");
    return () => {
      document.documentElement.classList.remove("calculator-responsive-text");
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isEditRoute) {
      resetDraft();
      return undefined;
    }

    setLoading(true);
    setLoadError(null);
    setCategoryNotRestored(false);

    fetchProductById(productId)
      .then((product) => {
        if (cancelled) return;
        const categoryPath = getCategoryPath(product.categoryKey);
        loadProductForEdit({
          product,
          nutrition: productToNutritionValues(product),
          categoryPath,
          foodType: product.foodType || "",
          efsaValues: productToEfsaValues(product),
        });
        if (!categoryPath) setCategoryNotRestored(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Kunne ikke hente produktet for redigering.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isEditRoute]);

  return (
    <div
      className="flex-grow-1 d-flex flex-column"
      style={{ backgroundColor: "#fafafa", fontFamily: "Inter, sans-serif" }}
    >
      <div className="d-flex flex-column gap-3 container py-4 flex-grow-1">
        <Breadcrumb className="mb-0 new-calc-breadcrumb">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Hjem
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>
            Produkter
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {isEditRoute ? "Rediger produkt" : "Kalkulator"}
          </Breadcrumb.Item>
        </Breadcrumb>

        <div>
          <h1 className="fs-2">
            {isEditRoute
              ? "Rediger produkt"
              : "Mulige ernærings- og helsepåstander"}
          </h1>
          <p className="mt-3 mb-1" style={{ lineHeight: 1.7 }}>
            {isEditRoute
              ? "Feltene under er fylt ut med produktets lagrede verdier. Trykk «Beregn» for å oppdatere resultatet før du lagrer endringene."
              : "Denne kalkulatoren hjelper deg å sjekke om et matprodukt kan merkes med Nøkkelhullet og hvilke EFSA-godkjente ernærings- og helsepåstander det kan bruke, basert på næringsinnholdet du legger inn."}
          </p>
        </div>

        {loadError && <WarningAlert messages={loadError} />}

        {categoryNotRestored && !loadError && (
          <WarningAlert
            messages="Produktets matkategori kunne ikke gjenopprettes automatisk (eldre produkt). Velg matkategori og mattype på nytt under."
          />
        )}

        {loading ? (
          <p>Henter produkt…</p>
        ) : (
          <>
            <CalculatorInstructions />

            <ProductInfoSection />

            <div className="d-flex flex-wrap flex-grow-1 gap-4">
              <NutritionForm />
              <NutritionResult />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calculator;
