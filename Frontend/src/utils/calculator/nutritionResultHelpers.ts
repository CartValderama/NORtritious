import { CLAIMS_CONFIG, type ClaimConfigEntry } from "./ClaimResult";
import { EFSA_CLAIM_FIELDS } from "./efsaClaimFields";
import { OTHER_SUBSTANCE_OPTIONS } from "./otherSubstanceOptions";
import type { NutritionValues } from "./nutritionFormFields";

// Reverse lookup: backend claim name string (e.g. "Lavt Fettinnhold") -> CLAIMS_CONFIG entry/key.
export const CLAIMS_BY_NAME: Record<string, ClaimConfigEntry & { key: string }> =
  Object.fromEntries(
    Object.entries(CLAIMS_CONFIG).map(
      ([key, cfg]): [string, ClaimConfigEntry & { key: string }] => [
        cfg.name,
        { ...cfg, key },
      ],
    ),
  );

// The backend echoes back the English substance name it was given (it's also the lookup
// key), so translate it to the Norwegian label for display.
export const translateSubstanceName = (name: string): string =>
  OTHER_SUBSTANCE_OPTIONS.find((o) => o.value === name)?.label || name;

// Labels for the nutrition-table fields, used to build the per-claim statistic line.
export const FIELD_LABELS: Record<string, string> = {
  fett: "Fett",
  mettede: "Mettede fettsyrer",
  transfett: "Transfett",
  karbohydrat: "Karbohydrat",
  naturligSukker: "Naturlig sukker",
  hvoravSukkerarter: "Tilsatt sukker",
  kostfiber: "Kostfiber",
  protein: "Protein",
  naturligSalt: "Naturlig salt",
  tilsattSalt: "Tilsatt salt",
};

// Builds "Fett: 7 g/100 g, Salt: 0.3 g/100 g" for the fields a given claim depends on.
export const buildClaimStatistic = (
  claimKey: string,
  nutrition: NutritionValues | null | undefined,
): string | null => {
  const fields = EFSA_CLAIM_FIELDS[claimKey] || [];
  if (fields.length === 0 || !nutrition) return null;
  return fields
    .map((f) => `${FIELD_LABELS[f] || f}: ${Number(nutrition[f]) || 0} g/100 g`)
    .join(", ");
};

// Claims that are liquid-only or solid-only — keyed by CLAIMS_CONFIG key.
// Liquid-only: energyFree (never applies to solid food)
// Solid-only: increasedHighFibre, reducedHighFibre (backend always returns false for liquid)
export const LIQUID_ONLY_CLAIMS = new Set(["energyFree"]);
export const SOLID_ONLY_CLAIMS = new Set(["increasedHighFibre", "reducedHighFibre"]);

interface ResultSummaryInput {
  hasNokkelhullet?: boolean;
  efsaNutritionClaims?: string[];
}

// Template for the summary line under the "Resultat" heading. {placeholders} are
// swapped out with the live result data in buildResultSummary below.
export const buildResultSummary = (
  result: ResultSummaryInput,
  foodType: string,
): string => {
  const nokkelhulletPassed = result.hasNokkelhullet === true;
  const efsaTotalCount = Object.entries(CLAIMS_CONFIG).filter(([key]) => {
    if (foodType === "solid" && LIQUID_ONLY_CLAIMS.has(key)) return false;
    if (foodType === "liquid" && SOLID_ONLY_CLAIMS.has(key)) return false;
    return true;
  }).length;
  const efsaMetCount = (result.efsaNutritionClaims || []).length;

  return (
    `Nøkkelhullet er ${nokkelhulletPassed ? "oppfylt" : "ikke oppfylt"} for denne kategorien. ` +
    `${efsaMetCount} av ${efsaTotalCount} mulige EFSA-ernæringspåstander er oppfylt.`
  );
};

// Energy has to come from fat/carbs/protein/fibre — if all four are 0 but energy isn't,
// that's physically impossible for a solid, and unusual (only alcohol/polyols/organic acids
// could explain it) for a liquid. Flag it without blocking anything.
export const getEnergyMismatchWarning = (
  nutrition: NutritionValues | null | undefined,
  foodType: string,
): string | null => {
  if (!nutrition) return null;

  const fat = Number(nutrition.fett) || 0;
  const carbs = Number(nutrition.karbohydrat) || 0;
  const protein = Number(nutrition.protein) || 0;
  const fibre = Number(nutrition.kostfiber) || 0;
  const hasEnergy =
    (Number(nutrition.energikcal) || 0) > 0 ||
    (Number(nutrition.energikj) || 0) > 0;
  const allMacrosZero =
    fat === 0 && carbs === 0 && protein === 0 && fibre === 0;

  if (!hasEnergy || !allMacrosZero) return null;

  return foodType === "solid"
    ? "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. Dette er normalt ikke mulig for et fast produkt, siden energi kommer fra disse næringsstoffene. Kontroller verdiene."
    : "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene er riktige.";
};

// General case (covers more than the all-zero one above): the entered energy should be
// roughly what fat/carbs/protein/fibre add up to, using the EU's fixed conversion factors
// (9/4/4/2 kcal per gram, or 37/17/17/8 kJ per gram). A big gap either way — energy far
// higher or far lower than the macros justify — usually means a data-entry mistake.
export const getEnergyFormulaWarning = (
  nutrition: NutritionValues | null | undefined,
  foodType: string,
): string | null => {
  if (!nutrition) return null;

  const fat = Number(nutrition.fett) || 0;
  const carbs = Number(nutrition.karbohydrat) || 0;
  const protein = Number(nutrition.protein) || 0;
  const fibre = Number(nutrition.kostfiber) || 0;
  const allMacrosZero = fat === 0 && carbs === 0 && protein === 0 && fibre === 0;
  if (allMacrosZero) return null; // already covered by getEnergyMismatchWarning

  const energyKcal = Number(nutrition.energikcal) || 0;
  const energyKj = Number(nutrition.energikj) || 0;

  let entered: number, expected: number, unit: string;
  if (energyKcal > 0) {
    entered = energyKcal;
    expected = fat * 9 + carbs * 4 + protein * 4 + fibre * 2;
    unit = "kcal";
  } else if (energyKj > 0) {
    entered = energyKj;
    expected = fat * 37 + carbs * 17 + protein * 17 + fibre * 8;
    unit = "kJ";
  } else {
    return null;
  }

  if (expected <= 0) return null;

  // Outside roughly half to 1.5x the expected value — generous enough to allow for
  // label rounding and untracked substances (alcohol, polyols, organic acids).
  const ratio = entered / expected;
  if (ratio >= 0.5 && ratio <= 1.5) return null;

  return (
    `Du har oppgitt ${entered} ${unit} energi, mens fett er ${fat} g, karbohydrat er ${carbs} g, ` +
    `protein er ${protein} g og kostfiber er ${fibre} g. ` +
    (foodType === "solid"
      ? "Kontroller at disse stemmer med hverandre."
      : "Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene stemmer med hverandre.")
  );
};
