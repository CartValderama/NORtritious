import { nokkelhulletThresholds } from "./kravNokkelhullet";

// Builds a per-requirement pass/fail breakdown for a category's Nøkkelhullet thresholds,
// using the same comparisons as isFieldFailing in NutritionForm.jsx.
// Each entry carries the nutrient name, the actual entered value, and the threshold,
// so the UI can render a "statistics" view (actual vs. required) with the numbers bolded.
export const evaluateNokkelhulletRequirements = (category, nutrition) => {
  const t = nokkelhulletThresholds[category];
  if (!t) return [];

  const fett = Number(nutrition.fett) || 0;
  const mettede = Number(nutrition.mettede) || 0;
  const naturligSukker = Number(nutrition.naturligSukker) || 0;
  const hvoravSukkerarter = Number(nutrition.hvoravSukkerarter) || 0;
  const kostfiber = Number(nutrition.kostfiber) || 0;
  const salt = (Number(nutrition.naturligSalt) || 0) + (Number(nutrition.tilsattSalt) || 0);

  const requirements = [];

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
      unit: `g/100 g (${t.dynamicSatFatFraction * 100} % av fett)`,
      passed: mettede <= fett * t.dynamicSatFatFraction,
    });
  }

  if (t.maxTotalSugars != null) {
    requirements.push({
      key: "maxTotalSugars",
      nutrient: "Sukkerarter (totalt)",
      actualValue: naturligSukker + hvoravSukkerarter,
      comparator: "≤",
      thresholdValue: t.maxTotalSugars,
      unit: "g/100 g",
      passed: naturligSukker + hvoravSukkerarter <= t.maxTotalSugars,
    });
  }

  if (t.maxAddedSugars != null) {
    requirements.push({
      key: "maxAddedSugars",
      nutrient: "Tilsatte sukkerarter",
      actualValue: hvoravSukkerarter,
      comparator: "≤",
      thresholdValue: t.maxAddedSugars,
      unit: "g/100 g",
      passed: hvoravSukkerarter <= t.maxAddedSugars,
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

  const comparatorText = { "≤": "lavere enn eller lik", "≥": "minst" };

  return requirements.map((r) => ({
    ...r,
    description: `Kravet er at mengden av ${r.nutrient.toLowerCase()} skal være ${
      comparatorText[r.comparator]
    } ${r.thresholdValue} ${r.unit}.`,
  }));
};
