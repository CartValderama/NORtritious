import type { RuleAssessment } from "./nutritionResultHelpers";

// Nøkkelhullet-specific display. The title says *how* a criterion failed rather than showing
// a bare comparator, which reads better for a nutrient ("Fett (for høyt)") but would be wrong
// for an EFSA claim name, so this stays on the Nøkkelhullet side rather than being shared.
//
// Derived from passed and comparator, both of which the response carries. The sentence that
// used to be built here comes from the backend now, on RuleAssessment.explanation, so no
// threshold is restated anywhere in this file.
export const buildRequirementTitle = (req: RuleAssessment): string =>
  req.passed
    ? req.label
    : `${req.label} (${req.comparator === "≤" ? "for høyt" : "for lavt"})`;
