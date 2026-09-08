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
  { key: "sukkerarter", label: "Sukkerarter", unit: "g", placeholder: "f.eks. 8" },
  { key: "kostfiber", label: "Kostfiber", unit: "g", placeholder: "f.eks. 3" },
  { key: "protein", label: "Protein", unit: "g", placeholder: "f.eks. 8" },
  { key: "salt", label: "Salt", unit: "g", placeholder: "f.eks. 0,7" },
];

export const EMPTY_NUTRITION: NutritionValues = {
  energikj: "",
  energikcal: "",
  fett: "",
  mettede: "",
  transfett: "",
  karbohydrat: "",
  sukkerarter: "",
  kostfiber: "",
  protein: "",
  salt: "",
};

// Maps each nutrition field key to the kravNokkelhullet property names that cover it.
const NOKKELHULLET_FIELD_MAP: Record<string, string[]> = {
  fett: ["fett"],
  mettede: ["mettede"],
  sukkerarter: ["sukkerarter", "tilsattSukkerarter"],
  kostfiber: ["kostfiber"],
  salt: ["salt"],
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
  if (key === "sukkerarter" && ZERO_SUGAR_CATEGORIES.has(category)) {
    return false;
  }
  if (key === "protein" && NO_PROTEIN_CATEGORIES.has(category)) {
    return false;
  }
  return (
    isNokkelhulletField(key, category) ||
    isEfsaRelevantField(key) ||
    ALWAYS_RELEVANT_FIELDS.includes(key) ||
    key === "sukkerarter"
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
    // No natural/added split anymore (single field) — checked against both
    // thresholds where the category defines them, using the one number for
    // each. Stricter than the real rule for MaxAddedSugars-only categories
    // (can't prove none of it is added), the safe direction for a compliance
    // tool: never falsely say a product qualifies.
    case "sukkerarter":
      return (
        (t.maxTotalSugars != null && val > t.maxTotalSugars) ||
        (t.maxAddedSugars != null && val > t.maxAddedSugars)
      );
    case "kostfiber":
      return t.minFibre != null && val < t.minFibre;
    case "salt":
      return t.maxSalt != null && val > t.maxSalt;
    default:
      return false;
  }
};

const NOKKELHULLET_FIELD_LABELS: Record<string, string> = {
  fett: "fett",
  mettede: "mettede fettsyrer",
  sukkerarter: "sukkerarter",
  kostfiber: "kostfiber",
  salt: "salt",
};

// Norway uses a comma as the decimal separator (e.g. "0,7" not "0.7") — every number shown
// to the user goes through this instead of raw interpolation, which always uses ".".
export const formatNoNumber = (value: number): string =>
  value.toString().replace(".", ",");

// Nutrition inputs are type="text" (not type="number") specifically so a typed comma isn't
// silently rejected by the browser — native number inputs only accept "." as the decimal
// separator in most browser locales regardless of the page's own language. Rejects anything
// that isn't a plausible in-progress decimal (digits with at most one comma/period) and
// normalizes the separator to "." so every existing Number(nutrition[key]) call downstream
// keeps working unchanged.
export const sanitizeDecimalInput = (raw: string): string | null =>
  /^\d*[.,]?\d*$/.test(raw) ? raw.replace(",", ".") : null;

// The mirror of sanitizeDecimalInput's normalization, for display: fields are stored with
// "." (so every Number(nutrition[key]) call keeps working unchanged) but shown to the user
// with "," — this converts a stored value back for the input's own value prop.
export const toDisplayDecimal = (value: string): string => value.replace(".", ",");

const buildNokkelhulletMessage = (
  label: string,
  comparison: string,
  value: string | number,
): string =>
  `Produktet innfrir ikke Nøkkelhullet på grunn av mengden ${label}. ` +
  `Mengden på ${label} må være ${comparison} ${typeof value === "number" ? formatNoNumber(value) : value} g/100 g for å møte kravene for Nøkkelhullsmerking.`;

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
          `${formatNoNumber(t.dynamicSatFatFraction * 100)} % av fett`,
        );
      }
      return "";
    // Reports whichever cap is stricter when a category defines both — that's
    // the actually binding constraint, since staying under it also satisfies
    // the looser one.
    case "sukkerarter": {
      const caps = [t.maxTotalSugars, t.maxAddedSugars].filter(
        (v): v is number => v != null,
      );
      if (caps.length === 0) return "";
      return buildNokkelhulletMessage(
        NOKKELHULLET_FIELD_LABELS.sukkerarter,
        "lavere enn eller lik",
        Math.min(...caps),
      );
    }
    case "kostfiber":
      return t.minFibre != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.kostfiber,
            "minst",
            t.minFibre,
          )
        : "";
    case "salt":
      return t.maxSalt != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.salt,
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
    // No natural/added split anymore (single field, client requirement) — the
    // full total is sent as addedSugars so both the backend's MaxTotalSugars
    // check (naturalSugars + addedSugars) and MaxAddedSugars check still work
    // off it, just stricter than the real rule for MaxAddedSugars-only
    // categories (see CheckNokkelhullet's comment in CalculatorService.cs).
    naturalSugars: 0,
    addedSugars: ZERO_SUGAR_CATEGORIES.has(category)
      ? 0
      : Number(nutrition.sukkerarter),
    fibre: Number(nutrition.kostfiber),
    protein: Number(nutrition.protein),
    // addedSalt no longer tracked separately — the backend's "Uten tilsatt
    // salt" claim that needed it is already disabled (CalculatorService.cs),
    // so always sending 0 has no effect on any active calculation.
    salt: Number(nutrition.salt) || 0,
    addedSalt: 0,
    totalStarch: Number(totalStarch) || 0,
    resistantStarch: Number(resistantStarch) || 0,
  },
  others: (otherSubstances || []).map((s) => ({
    name: s.name,
    amount: Number(s.amount) || 0,
  })),
});
