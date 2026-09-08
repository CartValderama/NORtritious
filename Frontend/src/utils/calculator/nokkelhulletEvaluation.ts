import { nokkelhulletThresholds } from "./kravNokkelhullet";
import { formatNoNumber, type NutritionValues } from "./nutritionFormFields";

interface RequirementBase {
  key: string;
  nutrient: string;
  actualValue: number;
  comparator: string;
  thresholdValue: number;
  unit: string;
  passed: boolean;
}

export interface NokkelhulletRequirement extends RequirementBase {
  description: string;
}

// Builds a per-requirement pass/fail breakdown for a category's Nøkkelhullet thresholds,
// using the same comparisons as isFieldFailing in nutritionFormFields.ts.
// Each entry carries the nutrient name, the actual entered value, and the threshold,
// so the UI can render a "statistics" view (actual vs. required) with the numbers bolded.
export const evaluateNokkelhulletRequirements = (
  category: string,
  nutrition: NutritionValues,
): NokkelhulletRequirement[] => {
  const t = nokkelhulletThresholds[category];
  if (!t) return [];

  const fett = Number(nutrition.fett) || 0;
  const mettede = Number(nutrition.mettede) || 0;
  const sukkerarter = Number(nutrition.sukkerarter) || 0;
  const kostfiber = Number(nutrition.kostfiber) || 0;
  const salt = Number(nutrition.salt) || 0;

  const requirements: RequirementBase[] = [];

  if (t.maxFat != null) {
    requirements.push({
      key: "maxFat",
      nutrient: "Fett",
      actualValue: fett,
      comparator: "≤",
      thresholdValue: t.maxFat,
      unit: "g/100 g",
      passed: fett <= t.maxFat,
    });
  }

  if (t.maxSatFat != null) {
    requirements.push({
      key: "maxSatFat",
      nutrient: "Mettede fettsyrer",
      actualValue: mettede,
      comparator: "≤",
      thresholdValue: t.maxSatFat,
      unit: "g/100 g",
      passed: mettede <= t.maxSatFat,
    });
  } else if (t.dynamicSatFatFraction != null) {
    requirements.push({
      key: "dynamicSatFatFraction",
      nutrient: "Mettede fettsyrer",
      actualValue: mettede,
      comparator: "≤",
      thresholdValue: Number((fett * t.dynamicSatFatFraction).toFixed(2)),
      unit: `g/100 g (${formatNoNumber(t.dynamicSatFatFraction * 100)} % av fett)`,
      passed: mettede <= fett * t.dynamicSatFatFraction,
    });
  }

  // No natural/added split anymore (single field) — one row using whichever
  // cap is stricter when a category defines both (see isFieldFailing's
  // comment in nutritionFormFields.ts for why that's the safe direction).
  if (t.maxTotalSugars != null || t.maxAddedSugars != null) {
    const threshold = Math.min(
      ...[t.maxTotalSugars, t.maxAddedSugars].filter(
        (v): v is number => v != null,
      ),
    );
    requirements.push({
      key: "maxSukkerarter",
      nutrient: "Sukkerarter",
      actualValue: sukkerarter,
      comparator: "≤",
      thresholdValue: threshold,
      unit: "g/100 g",
      passed: sukkerarter <= threshold,
    });
  }

  if (t.minFibre != null) {
    requirements.push({
      key: "minFibre",
      nutrient: "Kostfiber",
      actualValue: kostfiber,
      comparator: "≥",
      thresholdValue: t.minFibre,
      unit: "g/100 g",
      passed: kostfiber >= t.minFibre,
    });
  }

  if (t.maxSalt != null) {
    requirements.push({
      key: "maxSalt",
      nutrient: "Salt",
      actualValue: salt,
      comparator: "≤",
      thresholdValue: t.maxSalt,
      unit: "g/100 g",
      passed: salt <= t.maxSalt,
    });
  }

  const comparatorText: Record<string, string> = { "≤": "lavere enn eller lik", "≥": "minst" };

  return requirements.map((r) => ({
    ...r,
    description: `Kravet er at mengden av ${r.nutrient.toLowerCase()} skal være ${
      comparatorText[r.comparator]
    } ${formatNoNumber(r.thresholdValue)} ${r.unit}.`,
  }));
};

const comparatorWord = (comparator: string): string =>
  comparator === "≤" ? "høyst" : "minst";
const directionLabel = (req: NokkelhulletRequirement): string =>
  req.comparator === "≤" ? "for høyt" : "for lavt";

// Title says *how* a requirement failed (too high / too low) instead of showing the raw
// comparator symbol; the actual numbers only appear in the natural-language description.
export const buildRequirementTitle = (req: NokkelhulletRequirement): string =>
  req.passed ? req.nutrient : `${req.nutrient} (${directionLabel(req)})`;

export const buildRequirementDetail = (req: NokkelhulletRequirement): string =>
  `Produktet inneholder ${formatNoNumber(req.actualValue)} ${req.unit}, ${
    req.passed ? "som oppfyller kravet om" : "men kravet er"
  } ${comparatorWord(req.comparator)} ${formatNoNumber(req.thresholdValue)} ${req.unit}.`;
