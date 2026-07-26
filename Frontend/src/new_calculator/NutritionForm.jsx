import React, { useState } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import API_URL from "../apiConfig";
import { kategorier, nokkelhulletThresholds } from "./kravNokkelhullet";
import { EFSA_CLAIM_FIELDS } from "./efsaClaimFields";
import keyholeLogo from "../img/new_resized_image_1.png";
import banKeyhole from "../img/ban_keyhole.png";
import efsaLogo from "../img/efsaLogo.png";

// Every field's label reserves this much height — tall enough to fit the Energi
// field's kcal/kJ toggle — so all inputs start at the same row regardless of
// whether a given label is plain text or has extra controls in it.
const LABEL_ROW_HEIGHT = "32px";

const NUTRITION_FIELDS = [
  { key: "fett", label: "Fett", unit: "g" },
  { key: "mettede", label: "Mettede fettsyrer", unit: "g" },
  { key: "transfett", label: "Transfett", unit: "g" },
  { key: "karbohydrat", label: "Karbohydrat", unit: "g" },
  { key: "naturligSukker", label: "Naturlig sukker", unit: "g" },
  { key: "hvoravSukkerarter", label: "Tilsatt sukker", unit: "g" },
  { key: "kostfiber", label: "Kostfiber", unit: "g" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "naturligSalt", label: "Naturlig salt", unit: "g" },
  { key: "tilsattSalt", label: "Tilsatt salt", unit: "g" },
];

const EMPTY_NUTRITION = {
  energikj: "",
  energikcal: "",
  fett: "",
  mettede: "",
  transfett: "",
  karbohydrat: "",
  naturligSukker: "",
  hvoravSukkerarter: "",
  kostfiber: "",
  protein: "",
  naturligSalt: "",
  tilsattSalt: "",
};

// Maps each nutrition field key to the kravNokkelhullet property names that cover it.
const NOKKELHULLET_FIELD_MAP = {
  fett: ["fett"],
  mettede: ["mettede"],
  naturligSukker: ["sukkerarter"],
  hvoravSukkerarter: ["sukkerarter", "tilsattSukkerarter"],
  kostfiber: ["kostfiber"],
  naturligSalt: ["salt"],
  tilsattSalt: ["salt"],
};

const isNokkelhulletField = (key, category) => {
  const reqs = kategorier[category];
  if (!reqs) return false;
  const reqKeys = NOKKELHULLET_FIELD_MAP[key];
  if (!reqKeys) return false;
  return reqKeys.some((k) => reqs[k] != null);
};

// Whether `key` is needed for at least one (currently active) EFSA claim.
// EFSA claims apply to every category now, so this no longer depends on category.
const isEfsaRelevantField = (key) =>
  Object.values(EFSA_CLAIM_FIELDS).some((fields) => fields.includes(key));

// Categories where sugar content is always 0 — no MaxTotalSugars or MaxAddedSugars
// threshold exists, so sugar inputs are hidden and auto-sent as 0.
const ZERO_SUGAR_CATEGORIES = new Set([
  "Kategori0",
  "Kategori2",
  "Kategori3",
  "Kategori4",
  "Kategori5",
  "Kategori10",
  "Kategori16",
  "Kategori17",
  "Kategori19",
  "Kategori20",
  "Kategori21",
  "Kategori23",
  "Melk11a",
  "Melk12a",
  "Melk14a",
]);

// Categories where protein is negligible and EFSA protein claims can never apply:
// pure oils/fats (zero protein) and oil-based dressings (near-zero protein).
// Raw fruits/berries (Kategori2) are also excluded — too low to reach the 12% threshold.
const NO_PROTEIN_CATEGORIES = new Set([
  "Kategori2", // frukt og bær (uforedlet)
  "Kategori19", // matfett og matfettblandinger
  "Kategori20", // matoljer og flytende matfett
  "Kategori31", // dressinger av olje og eddik
]);

// Karbohydrat must always be shown. Sugar is always shown unless
// the category is in ZERO_SUGAR_CATEGORIES.
const ALWAYS_RELEVANT_FIELDS = ["karbohydrat"];

// A field is shown if it feeds the Nøkkelhullet check for this category, one of
// the active EFSA nutrition claims, or the always-on carbohydrate health claim.
const isFieldRelevant = (key, category) => {
  if (
    ["naturligSukker", "hvoravSukkerarter"].includes(key) &&
    ZERO_SUGAR_CATEGORIES.has(category)
  ) {
    return false;
  }
  if (key === "protein" && NO_PROTEIN_CATEGORIES.has(category)) {
    return false;
  }
  return (
    isNokkelhulletField(key, category) ||
    isEfsaRelevantField(key) ||
    ALWAYS_RELEVANT_FIELDS.includes(key) ||
    ["naturligSukker", "hvoravSukkerarter"].includes(key)
  );
};

const isFieldFailing = (key, category, nutrition) => {
  const t = nokkelhulletThresholds[category];
  if (!t) return false;
  const val = Number(nutrition[key]);
  if (nutrition[key] === "" || isNaN(val)) return false;

  switch (key) {
    case "fett":
      return t.maxFat != null && val > t.maxFat;
    case "mettede": {
      const fat = Number(nutrition.fett) || 0;
      return (
        (t.maxSatFat != null && val > t.maxSatFat) ||
        (t.dynamicSatFatFraction != null && val > fat * t.dynamicSatFatFraction)
      );
    }
    case "naturligSukker":
      return (
        t.maxTotalSugars != null &&
        val + (Number(nutrition.hvoravSukkerarter) || 0) > t.maxTotalSugars
      );
    case "hvoravSukkerarter":
      return (
        (t.maxAddedSugars != null && val > t.maxAddedSugars) ||
        (t.maxTotalSugars != null &&
          val + (Number(nutrition.naturligSukker) || 0) > t.maxTotalSugars)
      );
    case "kostfiber":
      return t.minFibre != null && val < t.minFibre;
    case "naturligSalt":
      return (
        t.maxSalt != null &&
        val + (Number(nutrition.tilsattSalt) || 0) > t.maxSalt
      );
    case "tilsattSalt":
      return (
        t.maxSalt != null &&
        val + (Number(nutrition.naturligSalt) || 0) > t.maxSalt
      );
    default:
      return false;
  }
};

const NOKKELHULLET_FIELD_LABELS = {
  fett: "fett",
  mettede: "mettede fettsyrer",
  naturligSukker: "sukkerarter",
  hvoravSukkerarter: "tilsatte sukkerarter",
  kostfiber: "kostfiber",
  naturligSalt: "salt",
  tilsattSalt: "salt",
};

const buildNokkelhulletMessage = (label, comparison, value) =>
  `Produktet innfrir ikke Nøkkelhullet på grunn av mengden ${label}. ` +
  `Mengden på ${label} må være ${comparison} ${value} g/100 g for å møte kravene for Nøkkelhullsmerking.`;

// Builds the human-readable reason a field fails Nøkkelhullet, based on the same
// thresholds isFieldFailing checks against.
const getNokkelhulletFailureMessage = (key, category) => {
  const t = nokkelhulletThresholds[category];
  if (!t) return "";

  switch (key) {
    case "fett":
      return t.maxFat != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.fett,
            "lavere enn eller lik",
            t.maxFat,
          )
        : "";
    case "mettede":
      if (t.maxSatFat != null) {
        return buildNokkelhulletMessage(
          NOKKELHULLET_FIELD_LABELS.mettede,
          "lavere enn eller lik",
          t.maxSatFat,
        );
      }
      if (t.dynamicSatFatFraction != null) {
        return buildNokkelhulletMessage(
          NOKKELHULLET_FIELD_LABELS.mettede,
          "lavere enn eller lik",
          `${t.dynamicSatFatFraction * 100} % av fett`,
        );
      }
      return "";
    case "naturligSukker":
      return t.maxTotalSugars != null
        ? buildNokkelhulletMessage(
            "sukkerarter",
            "lavere enn eller lik",
            t.maxTotalSugars,
          )
        : "";
    case "hvoravSukkerarter":
      if (t.maxAddedSugars != null) {
        return buildNokkelhulletMessage(
          NOKKELHULLET_FIELD_LABELS.hvoravSukkerarter,
          "lavere enn eller lik",
          t.maxAddedSugars,
        );
      }
      if (t.maxTotalSugars != null) {
        return buildNokkelhulletMessage(
          "sukkerarter",
          "lavere enn eller lik",
          t.maxTotalSugars,
        );
      }
      return "";
    case "kostfiber":
      return t.minFibre != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.kostfiber,
            "minst",
            t.minFibre,
          )
        : "";
    case "naturligSalt":
    case "tilsattSalt":
      return t.maxSalt != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.naturligSalt,
            "lavere enn eller lik",
            t.maxSalt,
          )
        : "";
    default:
      return "";
  }
};

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
    return (
      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted rounded p-4">
        <i
          className="bi bi-calculator mb-2 opacity-50"
          style={{ fontSize: "6rem" }}
        />
        <p className="mb-0 fw-medium fs-5">
          Velg en matkategori for å starte beregningen
        </p>
      </div>
    );
  }

  if (!foodType) {
    return (
      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted rounded p-4">
        <i
          className="bi bi-calculator mb-2 opacity-50"
          style={{ fontSize: "6rem" }}
        />
        <p className="mb-0 fw-medium fs-5">
          Velg type matvare for å starte beregningen
        </p>
      </div>
    );
  }

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
      const { data } = await axios.post(
        `${API_URL}/api/calculator/calculate`,
        {
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
        },
        { withCredentials: true },
      );

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
      {/* ── Inputs: fields flow and wrap instead of one row per nutrient, so this
          stays compact no matter how many fields get added over time ──────── */}
      <div className="bg-white rounded">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="mb-0">Næringsinnhold</h2>
          <button
            type="button"
            className="btn btn-danger d-flex align-items-center gap-1"
            onClick={handleReset}
          >
            <i className="bi bi-arrow-counterclockwise" />
            Nullstill
          </button>
        </div>
        <p className="text-muted small mb-4">
          Fyll inn energi og næringsstoffer per 100 g/ml. Hvilke felt som vises
          avhenger av valgt matkategori.
        </p>
        <div
          className="d-flex flex-wrap"
          style={{ columnGap: "1rem", rowGap: "1.2rem" }}
        >
          {/* Energy field — unit toggle sits beside the label. Every label below
              reserves the same height (LABEL_ROW_HEIGHT) so this taller label doesn't
              push its input out of line with the rest of the fields. */}
          <div style={{ flex: "1 1 auto" }}>
            <label
              className="form-label mb-1 d-flex align-items-center gap-2"
              style={{ whiteSpace: "nowrap", height: LABEL_ROW_HEIGHT }}
            >
              Energi
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${energyUnit === "energikcal" ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => setEnergyUnit("energikcal")}
                >
                  kcal
                </button>
                <button
                  type="button"
                  className={`btn ${energyUnit === "energikj" ? "btn-success" : "btn-outline-secondary"}`}
                  onClick={() => setEnergyUnit("energikj")}
                >
                  kJ
                </button>
              </div>
            </label>
            <input
              type="number"
              min="0"
              className={`form-control ${errors.energy ? "is-invalid" : ""}`}
              style={{ width: "100%", maxWidth: "400px" }}
              value={
                energyUnit === "energikcal"
                  ? nutrition.energikcal
                  : nutrition.energikj
              }
              onChange={(e) => handleFieldChange(energyUnit, e.target.value)}
            />
          </div>

          {/* All other nutrition fields — only ones relevant to Nøkkelhullet or EFSA for this category */}
          {NUTRITION_FIELDS.filter(({ key }) =>
            isFieldRelevant(key, category),
          ).map(({ key, label, unit }) => {
            const nok = isNokkelhulletField(key, category);
            const nokFail =
              nok &&
              calculatedNutrition != null &&
              isFieldFailing(key, category, calculatedNutrition);
            return (
              <div key={key} style={{ flex: "1 1 auto" }}>
                <label
                  className="form-label mb-1 d-flex align-items-center"
                  style={{ whiteSpace: "nowrap", height: LABEL_ROW_HEIGHT }}
                >
                  {label} ({unit})
                  {nok && !nokFail && (
                    <img
                      src={keyholeLogo}
                      alt="Nøkkelhullet"
                      title="Brukes i Nøkkelhullet-beregningen"
                      style={{
                        width: "18px",
                        height: "auto",
                        marginLeft: "8px",
                        verticalAlign: "middle",
                        opacity: 0.75,
                      }}
                    />
                  )}
                  {nokFail && (
                    <Tooltip
                      title={getNokkelhulletFailureMessage(key, category)}
                      placement="right"
                      arrow
                    >
                      <img
                        src={banKeyhole}
                        alt="Nøkkelhullet ikke oppfylt"
                        style={{
                          width: "20px",
                          height: "auto",
                          marginLeft: "8px",
                          verticalAlign: "middle",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    ...(nokFail && !errors[key]
                      ? { borderColor: "#dc3545", borderWidth: "2px" }
                      : {}),
                  }}
                  value={nutrition[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-width expand toggle for the EFSA Helsepåstander panel */}
      <button
        type="button"
        className={`btn ${showHealthClaimsPanel ? "btn-primary" : "btn-outline-primary"} w-100 mt-4 py-2 d-flex align-items-center justify-content-center gap-2`}
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
        <div className="alert alert-warning py-2">
          Fyll inn alle næringsverdier (0 eller høyere) og velg mattype.
        </div>
      )}

      {/* Calculate button */}
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="btn btn-success"
          style={{ padding: "10px 24px", whiteSpace: "nowrap" }}
          onClick={handleCalculate}
          disabled={calculating}
        >
          {calculating ? "Beregner…" : "Beregn"}
        </button>
        {hasResult && (
          <button
            type="button"
            className="btn btn-outline-success"
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
