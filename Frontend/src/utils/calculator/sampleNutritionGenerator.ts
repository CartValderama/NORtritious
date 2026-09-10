import type { CalculatorSchema } from "../../services/calculatorService";
import {
  EMPTY_NUTRITION,
  isFieldRelevant,
  type NutritionValues,
} from "./nutritionFormFields";

// Plausible values for every field relevant to this category. "pass" stays comfortably
// inside every Nøkkelhullet limit this category has AND satisfies the EFSA nutrition
// claims (low sugar, sourceOfFibre) — green, or neutral for categories with no
// Nøkkelhullet requirements. "fail" breaches every Nøkkelhullet limit this category has
// AND every EFSA nutrition claim (high sugar, low fibre, high energy) — guaranteeing a
// fully red result on at least one of the two result sections even for categories with
// no Nøkkelhullet requirements at all. Energy is always computed to match via the EU's
// fixed conversion factors, so neither variant ever trips the energy mismatch/formula warning.
export const getSampleNutrition = (
  schema: CalculatorSchema,
  outcome: "pass" | "fail" = "pass",
): NutritionValues => {
  const t = schema?.thresholds || {};
  const round1 = (n: number) => Math.round(n * 10) / 10;
  // For a max-type threshold (fett, mettede, sukker, salt): <1 stays under, >1 breaches it.
  const maxFactor = outcome === "pass" ? 0.6 : 1.5;
  // For the one min-type threshold (kostfiber): >1 stays above the minimum, <1 dips below it.
  const minFactor = outcome === "pass" ? 1.3 : 0.5;

  const fett = t.maxFat != null ? t.maxFat * maxFactor : 5;
  const mettede =
    t.maxSatFat != null
      ? t.maxSatFat * maxFactor
      : t.dynamicSatFatFraction != null
        ? fett * t.dynamicSatFatFraction * maxFactor
        : Math.min(fett * 0.4, 2);
  const karbohydrat = 20;
  // No natural/added split anymore — one value checked against whichever cap(s)
  // the category defines (see isFieldFailing's comment in nutritionFormFields.ts),
  // so the sample must clear/breach the stricter of the two when both exist.
  // No category threshold: fall back to a value that itself clears (pass) or breaches
  // (fail) the EFSA "lavt sukkerinnhold" claim's fixed 5 g/100 g (solid) / 2.5 g/100 ml
  // (liquid) limit, so the EFSA nutrition claims section isn't left in a mixed state.
  const sugarCaps = [t.maxTotalSugars, t.maxAddedSugars].filter(
    (v): v is number => v != null,
  );
  const sukkerarter =
    sugarCaps.length > 0
      ? Math.min(...sugarCaps) * maxFactor
      : outcome === "pass"
        ? 2
        : 8;
  // No category threshold: fall back to a value that clears (pass, meets "kostfiberkilde"
  // at 3 g/100 g) or stays under (fail) the lowest EFSA fibre-claim bar.
  const kostfiber =
    t.minFibre != null ? t.minFibre * minFactor : outcome === "pass" ? 3 : 0.5;
  const protein = 8;
  const salt = t.maxSalt != null ? t.maxSalt * maxFactor : 0.5;
  const energikcal = Math.round(
    fett * 9 + karbohydrat * 4 + protein * 4 + kostfiber * 2,
  );

  const values: Record<string, number> = {
    fett,
    mettede,
    transfett: 0,
    karbohydrat,
    sukkerarter,
    kostfiber,
    protein,
    salt,
  };

  const sample: NutritionValues = { ...EMPTY_NUTRITION };
  Object.entries(values).forEach(([key, value]) => {
    if (isFieldRelevant(key, schema)) sample[key] = String(round1(value));
  });
  sample.energikcal = String(energikcal);
  sample.energikj = String(Math.round(energikcal * 4.184));

  return sample;
};
