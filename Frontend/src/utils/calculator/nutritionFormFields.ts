import { kategorier, nokkelhulletThresholds } from "./kravNokkelhullet";
import { EFSA_CLAIM_FIELDS } from "./efsaClaimFields";
import type { CalculatorRequestPayload } from "../../services/calculatorService";

// Nutrition-table field values, as held by the form (always strings — they come
// straight from <input> elements) and passed down to the result views afterwards.
export type NutritionValues = Record<string, string>;

interface NutritionFieldDef {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
}

export const NUTRITION_FIELDS: NutritionFieldDef[] = [
  { key: "fett", label: "Fett", unit: "g", placeholder: "f.eks. 5" },
  { key: "mettede", label: "Mettede fettsyrer", unit: "g", placeholder: "f.eks. 2" },
  { key: "transfett", label: "Transfett", unit: "g", placeholder: "f.eks. 0" },
  { key: "karbohydrat", label: "Karbohydrat", unit: "g", placeholder: "f.eks. 20" },
  { key: "naturligSukker", label: "Naturlig sukker", unit: "g", placeholder: "f.eks. 5" },
  { key: "hvoravSukkerarter", label: "Tilsatt sukker", unit: "g", placeholder: "f.eks. 3" },
  { key: "kostfiber", label: "Kostfiber", unit: "g", placeholder: "f.eks. 3" },
  { key: "protein", label: "Protein", unit: "g", placeholder: "f.eks. 8" },
  { key: "naturligSalt", label: "Naturlig salt", unit: "g", placeholder: "f.eks. 0,5" },
  { key: "tilsattSalt", label: "Tilsatt salt", unit: "g", placeholder: "f.eks. 0,2" },
];

export const EMPTY_NUTRITION: NutritionValues = {
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
const NOKKELHULLET_FIELD_MAP: Record<string, string[]> = {
  fett: ["fett"],
  mettede: ["mettede"],
  naturligSukker: ["sukkerarter"],
  hvoravSukkerarter: ["sukkerarter", "tilsattSukkerarter"],
  kostfiber: ["kostfiber"],
  naturligSalt: ["salt"],
  tilsattSalt: ["salt"],
};

export const isNokkelhulletField = (key: string, category: string): boolean => {
  const reqs = kategorier[category];
  if (!reqs) return false;
  const reqKeys = NOKKELHULLET_FIELD_MAP[key];
  if (!reqKeys) return false;
  return reqKeys.some((k) => reqs[k] != null);
};

// Whether `key` is needed for at least one (currently active) EFSA claim.
// EFSA claims apply to every category now, so this no longer depends on category.
const isEfsaRelevantField = (key: string): boolean =>
  Object.values(EFSA_CLAIM_FIELDS).some((fields) => fields.includes(key));

// Categories where sugar content is always 0 — no MaxTotalSugars or MaxAddedSugars
// threshold exists, so sugar inputs are hidden and auto-sent as 0.
export const ZERO_SUGAR_CATEGORIES = new Set([
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
export const isFieldRelevant = (key: string, category: string): boolean => {
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

export const isFieldFailing = (
  key: string,
  category: string,
  nutrition: NutritionValues,
): boolean => {
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

const NOKKELHULLET_FIELD_LABELS: Record<string, string> = {
  fett: "fett",
  mettede: "mettede fettsyrer",
  naturligSukker: "sukkerarter",
  hvoravSukkerarter: "tilsatte sukkerarter",
  kostfiber: "kostfiber",
  naturligSalt: "salt",
  tilsattSalt: "salt",
};

const buildNokkelhulletMessage = (
  label: string,
  comparison: string,
  value: string | number,
): string =>
  `Produktet innfrir ikke Nøkkelhullet på grunn av mengden ${label}. ` +
  `Mengden på ${label} må være ${comparison} ${value} g/100 g for å møte kravene for Nøkkelhullsmerking.`;

// Builds the human-readable reason a field fails Nøkkelhullet, based on the same
// thresholds isFieldFailing checks against.
export const getNokkelhulletFailureMessage = (
  key: string,
  category: string,
): string => {
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

export type NutritionFormErrors = Record<string, boolean>;

// Validates NutritionForm's fields before a calculation is submitted — every
// relevant field must be filled with a non-negative number, energy must be a
// positive number, and resistant starch can't exceed total starch. Doesn't
// include the onFoodTypeErrorChange side effect the caller also needs to
// fire — that's a prop callback, not part of the pure validation result.
export const validateNutritionForm = (
  foodType: string,
  energyUnit: string,
  nutrition: NutritionValues,
  category: string,
  resistantStarch: string,
  totalStarch: string,
): NutritionFormErrors => {
  const errs: NutritionFormErrors = {};
  if (!foodType) errs.foodType = true;
  const energyVal =
    energyUnit === "energikcal" ? nutrition.energikcal : nutrition.energikj;
  if (energyVal === "" || Number(energyVal) <= 0) errs.energy = true;
  NUTRITION_FIELDS.filter(({ key }) => isFieldRelevant(key, category)).forEach(
    ({ key }) => {
      if (nutrition[key] === "" || Number(nutrition[key]) < 0) errs[key] = true;
    },
  );
  if (Number(resistantStarch) > Number(totalStarch)) errs.resistantStarch = true;
  return errs;
};

// Maps NutritionForm's local form state (all strings, straight from <input>
// elements) to the numeric payload shape calculateNutrition sends the backend.
export const buildCalculationPayload = (
  category: string,
  foodType: string,
  energyUnit: string,
  portionSize: string,
  nutrition: NutritionValues,
  totalStarch: string,
  resistantStarch: string,
  otherSubstances: { name: string; amount: string | number }[],
): CalculatorRequestPayload => ({
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
