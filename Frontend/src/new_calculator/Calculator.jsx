import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Calculator.css";
import API_URL from "../apiConfig";
import * as ProductService from "../products/ProductService";
import ProductButtons from "../ProductButtons";
import CustomSelect from "../CustomSelect";
import NutritionForm from "./NutritionForm";
import NutritionResult from "./NutritionResult";
import { GROUP_OPTIONS } from "./data/categoryOptions";
import { OTHER_SUBSTANCE_OPTIONS } from "./data/otherSubstanceOptions";
import { useCalculatorState } from "./useCalculatorState.jsx";
import efsaLogo from "../img/efsaLogo.png";

const FOOD_TYPE_OPTIONS = [
  { value: "solid", label: "Fast form" },
  { value: "liquid", label: "Flytende form" },
];

// Not part of OtherClaimRegistry (backend) — Stivelse is its own dedicated
// TotalStarch/ResistantStarch field pair, never sent through the `others` list,
// so it deliberately lives outside OTHER_SUBSTANCE_OPTIONS. `inputType: "starchRatio"`
// tells the picker to render the two-field total/resistant input instead of the
// default single "Mengde" field; `requiresKostfiber: false` keeps it out of the
// Kostfiber gate/budget below.
const STARCH_OPTION = {
  value: "Stivelse",
  label: "Stivelse (resistent)",
  requiresKostfiber: false,
  inputType: "starchRatio",
};

// Every selectable "Kilde til Annet" option, fibre or not — new non-fibre kilder
// (vitamins, minerals, whatever comes next) just get added to OTHER_SUBSTANCE_OPTIONS
// with requiresKostfiber left false and flow through the default single-field path
// below without needing any special-casing here.
const KILDE_OPTIONS = [STARCH_OPTION, ...OTHER_SUBSTANCE_OPTIONS];

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
  const [hasStarch, setHasStarch] = useState(false);
  const [totalStarch, setTotalStarch] = useState("");
  const [resistantStarch, setResistantStarch] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [showPortionInfo, setShowPortionInfo] = useState(false);
  const [otherSubstances, setOtherSubstances] = useState([]);
  const [newSubstance, setNewSubstance] = useState(null);
  const [newSubstanceAmount, setNewSubstanceAmount] = useState("");
  const [substanceError, setSubstanceError] = useState("");
  const [showHealthClaimsPanel, setShowHealthClaimsPanel] = useState(false);
  const [showEfsaInfo, setShowEfsaInfo] = useState(false);

  const kildeOptionByValue = new Map(KILDE_OPTIONS.map((o) => [o.value, o]));

  const kostfiber = Number(nutrition.kostfiber) || 0;
  const hasFiberSource = kostfiber > 0;
  // Only sum kilder that are actually declared as Kostfiber subsets — a future
  // non-fibre "amount"-type kilde shouldn't count against this budget.
  const usedFiber = otherSubstances
    .filter((s) => kildeOptionByValue.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const fiberFullyUsed = hasFiberSource && usedFiber >= kostfiber;

  // "Added" state lives in different places depending on input shape: the
  // two-field ratio type (Stivelse) tracks itself via hasStarch, everything
  // else lives in the generic otherSubstances array.
  const isKildeAdded = (opt) =>
    opt.inputType === "starchRatio"
      ? hasStarch
      : otherSubstances.some((s) => s.name === opt.value);

  // Only options flagged requiresKostfiber get gated/removed once Kostfiber is
  // 0 or its budget is used up — everything else (Stivelse today, whatever
  // else gets added to Kilde til Annet later) stays selectable.
  const kildeOptions = KILDE_OPTIONS.filter((opt) => {
    if (isKildeAdded(opt)) return false;
    if (opt.requiresKostfiber && (!hasFiberSource || fiberFullyUsed))
      return false;
    return true;
  });

  // If Kostfiber goes back to 0/empty, any already-picked fibre substances no
  // longer make sense — clear them so nothing stale gets submitted.
  useEffect(() => {
    if (!hasFiberSource) {
      setOtherSubstances([]);
      setNewSubstance(null);
      setNewSubstanceAmount("");
      setSubstanceError("");
    }
  }, [hasFiberSource]);

  // Scroll the newly-expanded EFSA panel into view, so opening it from a button
  // further up the page doesn't leave the user staring at nothing new.
  useEffect(() => {
    if (showHealthClaimsPanel) {
      document
        .getElementById("efsa-health-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showHealthClaimsPanel]);

  // Clears every EFSA-panel field (Stivelse, Kilde til Annet, Porsjonsstørrelse) and any
  // stale calculation result — called from NutritionForm's "Nullstill" button, alongside
  // its own reset of the normal nutrition fields.
  const handleResetAll = () => {
    setHasStarch(false);
    setTotalStarch("");
    setResistantStarch("");
    setPortionSize("");
    setOtherSubstances([]);
    setNewSubstance(null);
    setNewSubstanceAmount("");
    setSubstanceError("");
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
      const formData = new FormData();
      formData.append("file", selectedImage);
      try {
        const response = await axios.post(
          `${API_URL}/api/products/upload-product-image`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );
        imageUrl = response.data.imageUrl;
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
          await axios.delete(`${API_URL}/api/products/delete-product-image`, {
            data: { imageUrl },
            withCredentials: true,
          });
        } catch (deleteError) {
          console.error(
            "Failed to delete orphaned image:",
            deleteError.response?.data || deleteError.message,
          );
        }
      }
    }
  };

  const handleAddSubstance = () => {
    if (!newSubstance) return;

    // The ratio input shape (Stivelse today) is validated/stored separately
    // from the generic amount-based kilder and never touches Kostfiber.
    if (newSubstance.inputType === "starchRatio") {
      if (!totalStarch) return;
      setHasStarch(true);
      setSubstanceError("");
      setNewSubstance(null);
      return;
    }

    if (!newSubstanceAmount) return;

    const amount = Number(newSubstanceAmount) || 0;
    if (newSubstance.requiresKostfiber) {
      if (fiberFullyUsed) return;

      // A specific fibre source can't exceed total Kostfiber — it's a subset of
      // it, and neither can the sum of every fibre source added together.
      const otherTotal = otherSubstances
        .filter(
          (s) =>
            s.name !== newSubstance.value &&
            kildeOptionByValue.get(s.name)?.requiresKostfiber,
        )
        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      if (otherTotal + amount > kostfiber) {
        setSubstanceError(
          `Summen av kilder (${otherTotal + amount}g) kan ikke overstige Kostfiber (${kostfiber}g) i næringstabellen.`,
        );
        return;
      }
    }

    setSubstanceError("");
    setOtherSubstances((prev) => [
      ...prev.filter((s) => s.name !== newSubstance.value),
      { name: newSubstance.value, amount: newSubstanceAmount },
    ]);
    setNewSubstance(null);
    setNewSubstanceAmount("");
  };

  const handleRemoveSubstance = (name) => {
    if (kildeOptionByValue.get(name)?.inputType === "starchRatio") {
      setHasStarch(false);
      setTotalStarch("");
      setResistantStarch("");
      return;
    }
    setOtherSubstances((prev) => prev.filter((s) => s.name !== name));
    setSubstanceError("");
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
        <div>
          <h2 className="mb-3">Legg inn næringsinnhold</h2>
          <p className="text-muted mb-4">
            Fyll ut produktinformasjonen og næringsverdiene under for å beregne
            Nøkkelhullet og eventuelle EFSA-påstander.
          </p>

          {/* Row 1: product name + image */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label htmlFor="name" className="form-label">
                Matvarenavn:
              </label>
              <input
                id="name"
                type="text"
                className="form-control"
                name="name"
                value={product.name}
                onChange={handleChange}
                placeholder="Matvarenavn"
              />
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="image" className="form-label">
                Last opp profilbilde:
              </label>
              <input
                type="file"
                className="form-control"
                id="image"
                name="image"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
              {selectedImage && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="img-thumbnail"
                    width="150"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 2: selectors */}
          <div className="row g-3">
            <div className="col-12 col-md">
              <label className="form-label">Matvaregruppe:</label>
              <CustomSelect
                placeholder={<div>Velg matvaregruppe</div>}
                className="form-select-md"
                onChange={(e) => {
                  setSelectGroups(e.value);
                  setSelectProduct("");
                  setSelectFragment("");
                  setSelectRation("");
                  setFoodType("");
                  setResult(null);
                  setResultNutrition(null);
                  setShowHealthClaimsPanel(false);
                }}
                options={GROUP_OPTIONS}
              />
            </div>

            <div className="col-12 col-md">
              <label className="form-label">Matkategori:</label>
              <CustomSelect
                key={selectsGroup}
                placeholder={<div>Velg mat</div>}
                className="form-select-md"
                isDisabled={productOptions.length === 0}
                onChange={(e) => {
                  setSelectProduct(e.value);
                  setSelectFragment("");
                  setSelectRation("");
                  setProduct((p) => ({
                    ...p,
                    type: `<strong>Matkategori:</strong> ${e.label}`,
                  }));
                  setResult(null);
                  setResultNutrition(null);
                }}
                options={productOptions}
              />
            </div>

            {fragmentOptions.length > 0 && (
              <div className="col-12 col-md">
                <label className="form-label">
                  <strong>Undermatkategori</strong>
                </label>
                <CustomSelect
                  placeholder={<div>Velg undermatkategori</div>}
                  className="form-select-md"
                  onChange={(e) => {
                    setSelectFragment(e.value);
                    setSelectRation("");
                    setResult(null);
                    setResultNutrition(null);
                  }}
                  options={fragmentOptions}
                />
              </div>
            )}

            {rationOptions.length > 0 && (
              <div className="col-12 col-md">
                <label className="form-label">
                  <strong>Undermatkategori</strong>
                </label>
                <CustomSelect
                  placeholder={<div>Velg undermatkategori</div>}
                  className="form-select-md"
                  onChange={(e) => {
                    setSelectRation(e.value);
                    setProduct((p) => ({ ...p, type: e.label }));
                    setResult(null);
                    setResultNutrition(null);
                  }}
                  options={rationOptions}
                />
              </div>
            )}

            <div className="col-12 col-md">
              <label htmlFor="foodType" className="form-label">
                Velg type matvare:
              </label>
              <CustomSelect
                key={selectsGroup}
                options={FOOD_TYPE_OPTIONS}
                placeholder="Velg mattype"
                onChange={(e) => setFoodType(e.value)}
              />
              {foodTypeError && (
                <div className="text-danger small mt-1">Velg mattype</div>
              )}
            </div>
          </div>
        </div>

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
              totalStarch={totalStarch}
              resistantStarch={resistantStarch}
              otherSubstances={otherSubstances}
              portionSize={portionSize}
              onResetAll={handleResetAll}
            >
              {showHealthClaimsPanel && (
                <div
                  id="efsa-health-panel"
                  className="px-3 py-4"
                  style={{
                    backgroundColor: "#fafafa",
                    borderRadius: "0.375rem",
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                >
                  {/* Header */}
                  <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
                    <div className="d-flex align-items-center">
                      <img
                        src={efsaLogo}
                        alt="EFSA"
                        style={{
                          width: "2rem",
                          height: "auto",
                          marginRight: "0.6rem",
                        }}
                      />
                      <h5 className="mb-0">EFSA Helsepåstander</h5>
                    </div>
                    <div className="position-relative">
                      <i
                        className="bi bi-info-circle text-muted fs-5"
                        style={{ cursor: "default" }}
                        onMouseEnter={() => setShowEfsaInfo(true)}
                        onMouseLeave={() => setShowEfsaInfo(false)}
                      />
                      {showEfsaInfo && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "1.8rem",
                            width: "300px",
                            backgroundColor: "#fff",
                            border: "1px solid #bbb",
                            borderRadius: "4px",
                            padding: "0.75rem 1rem",
                            zIndex: 100,
                          }}
                        >
                          <p className="fw-bold mb-2">EFSA Helsepåstander</p>
                          <p className="mb-2">
                            Du kan søke etter et bestemt næringsstoff i hvert
                            felt ved å taste inn navnet. For vitaminer og
                            mineraler er mengden man oppgir frivillig. Det er
                            forventet at matprodusenten har kjennskap til at
                            mengden oppfyller kravet for å kunne påstå at
                            produktet inneholder en kilde til stoffet.
                          </p>
                          <p className="mb-0 fw-bold">
                            Klikk på informasjonsikonet for å se hvilke krav som
                            må møtes i henhold til forordning (EF) nr.
                            1924/2006.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Porsjonsstørrelse — ett felt for hele produktet, brukt av påstander som krever en oppgitt porsjon */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-1 position-relative">
                      <label htmlFor="portionSize" className="form-label mb-0">
                        Porsjonsstørrelse av produktet (g/ml)
                      </label>
                      <i
                        className="bi bi-info-circle text-muted"
                        style={{
                          cursor: "default",
                          fontSize: "1rem",
                          flexShrink: 0,
                        }}
                        onMouseEnter={() => setShowPortionInfo(true)}
                        onMouseLeave={() => setShowPortionInfo(false)}
                      />
                      {showPortionInfo && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1.8rem",
                            left: 0,
                            width: "280px",
                            backgroundColor: "#fff",
                            border: "1px solid #bbb",
                            borderRadius: "4px",
                            padding: "0.75rem 1rem",
                            zIndex: 100,
                          }}
                        >
                          Dette feltet er nyttig for påstander som krever en
                          oppgitt porsjonsstørrelse (f.eks. beta-glukaner og
                          blodsukkerrespons). Å la det stå tomt påvirker ikke
                          andre beregninger.
                        </div>
                      )}
                    </div>
                    <input
                      id="portionSize"
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ maxWidth: "140px" }}
                      value={portionSize}
                      onChange={(e) => setPortionSize(e.target.value)}
                      placeholder="f.eks. 100"
                    />
                  </div>

                  {/* Kilde til Annet — fiberkilder/beta-glukaner (OtherClaimRegistry) og
                      Stivelse (dedikert TotalStarch/ResistantStarch-felt, policy_item_id
                      764557). Stivelse er ikke en delmengde av Kostfiber, så den er alltid
                      valgbar og omfattes ikke av Kostfiber-budsjettet under. */}
                  <div className="mb-3 border-top pt-3">
                    <div className="d-flex align-items-center mb-3">
                      <span className="fw-semibold me-2">Kilde til Annet</span>
                    </div>

                    {!hasFiberSource && (
                      <p
                        className="text-muted mb-2"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Kostfiber i næringstabellen er satt til 0 — kun
                        Stivelse kan legges til her.
                      </p>
                    )}

                    {fiberFullyUsed && (
                      <div className="text-warning small mb-2">
                        <i className="bi bi-exclamation-triangle me-1" />
                        All Kostfiber ({kostfiber}g) er allerede fordelt på
                        valgte fiberkilder. Fjern en for å legge til en annen
                        — andre typer kilder kan fortsatt legges til.
                      </div>
                    )}

                    <div className="d-flex flex-wrap align-items-end gap-2">
                      <div style={{ flex: "2 1 200px" }}>
                        <label
                          className="form-label d-block"
                          style={{
                            height: "1.2rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Velg kilde
                        </label>
                        <CustomSelect
                          options={kildeOptions}
                          placeholder="Velg kilde"
                          value={newSubstance}
                          onChange={(opt) => {
                            setNewSubstance(opt);
                            setSubstanceError("");
                          }}
                          isDisabled={kildeOptions.length === 0}
                        />
                      </div>

                      {newSubstance?.inputType === "starchRatio" ? (
                        <>
                          <div style={{ flex: "1 1 150px" }}>
                            <label
                              htmlFor="totalStarch"
                              className="form-label d-block"
                              style={{
                                height: "1.2rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              Totalt stivelse (g/100g)
                            </label>
                            <input
                              id="totalStarch"
                              type="number"
                              min="0"
                              max="100"
                              className="form-control"
                              value={totalStarch}
                              onChange={(e) => setTotalStarch(e.target.value)}
                              placeholder="f.eks. 50"
                            />
                          </div>
                          <div style={{ flex: "1 1 150px" }}>
                            <label
                              htmlFor="resistantStarch"
                              className="form-label d-block"
                              style={{
                                height: "1.2rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              Herav resistent (g/100g)
                            </label>
                            <input
                              id="resistantStarch"
                              type="number"
                              min="0"
                              max="100"
                              className="form-control"
                              value={resistantStarch}
                              onChange={(e) =>
                                setResistantStarch(e.target.value)
                              }
                              placeholder="f.eks. 10"
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{ flex: "1 1 150px" }}>
                          <label
                            className="form-label d-block"
                            style={{
                              height: "1.2rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            Mengde (g/100g)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={newSubstanceAmount}
                            onChange={(e) => {
                              setNewSubstanceAmount(e.target.value);
                              setSubstanceError("");
                            }}
                            placeholder="f.eks. 5"
                            disabled={newSubstance?.requiresKostfiber && fiberFullyUsed}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-success flex-shrink-0"
                        onClick={handleAddSubstance}
                        disabled={
                          !newSubstance ||
                          (newSubstance.inputType === "starchRatio"
                            ? !totalStarch
                            : !newSubstanceAmount ||
                              (newSubstance.requiresKostfiber &&
                                fiberFullyUsed))
                        }
                      >
                        Legg til
                      </button>
                    </div>

                    {newSubstance?.inputType === "starchRatio" &&
                      Number(resistantStarch) > Number(totalStarch) && (
                        <div className="text-danger small mt-2">
                          Resistent stivelse ({resistantStarch}g) kan ikke
                          overstige totalt stivelsesinnhold ({totalStarch}g).
                        </div>
                      )}

                    {substanceError && (
                      <div className="text-danger small mt-2">
                        {substanceError}
                      </div>
                    )}

                    {newSubstance?.inputType === "starchRatio" && (
                      <p
                        className="mt-1 mb-0 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Kun relevant hvis fordøyelig stivelse er erstattet med
                        resistent stivelse. Påstanden krever at resistent
                        stivelse utgjør minst 14 % av total stivelse.
                      </p>
                    )}

                    {[
                      "Beta-glucans",
                      "Barley beta-glucans",
                      "Oat beta-glucan",
                    ].includes(newSubstance?.value) && (
                      <p
                        className="mt-1 mb-0 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Bruker porsjonsstørrelsen øverst i panelet — uten den
                        kan ikke denne påstanden beregnes.
                      </p>
                    )}

                    {(hasStarch || otherSubstances.length > 0) && (
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {hasStarch && (
                          <div
                            className="d-flex align-items-stretch rounded-pill overflow-hidden"
                            style={{ fontSize: "0.85rem" }}
                          >
                            <span
                              className="d-flex align-items-center px-3 py-1"
                              style={{
                                backgroundColor: "#f1f1f1",
                                color: "#333",
                              }}
                            >
                              Stivelse — {totalStarch}g totalt,{" "}
                              {resistantStarch || 0}g resistent
                            </span>
                            <button
                              type="button"
                              className="d-flex align-items-center justify-content-center border-0 px-2"
                              style={{
                                backgroundColor: "#dc3545",
                                color: "#fff",
                              }}
                              onClick={() => handleRemoveSubstance("Stivelse")}
                              aria-label="Fjern Stivelse"
                            >
                              <i
                                className="bi bi-x-lg"
                                style={{ fontSize: "0.7rem" }}
                              />
                            </button>
                          </div>
                        )}

                        {otherSubstances.map((s) => {
                          const label =
                            OTHER_SUBSTANCE_OPTIONS.find(
                              (o) => o.value === s.name,
                            )?.label || s.name;
                          return (
                            <div
                              key={s.name}
                              className="d-flex align-items-stretch rounded-pill overflow-hidden"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <span
                                className="d-flex align-items-center px-3 py-1"
                                style={{
                                  backgroundColor: "#f1f1f1",
                                  color: "#333",
                                }}
                              >
                                {label} — {s.amount}g
                              </span>
                              <button
                                type="button"
                                className="d-flex align-items-center justify-content-center border-0 px-2"
                                style={{
                                  backgroundColor: "#dc3545",
                                  color: "#fff",
                                }}
                                onClick={() => handleRemoveSubstance(s.name)}
                                aria-label={`Fjern ${label}`}
                              >
                                <i
                                  className="bi bi-x-lg"
                                  style={{ fontSize: "0.7rem" }}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
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
