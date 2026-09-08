// Which nutrition-table field keys each EFSA claim depends on (mirrors the
// Claim* predicates in CalculatorService.cs). EFSA claims apply to every category,
// so this is not keyed by category — only by claim.
// Results are still scoped to energy + fiber; the extra entries here only control
// which input fields are shown so producers can fill them in ahead of time.
export const EFSA_CLAIM_FIELDS: Record<string, string[]> = {
  // Energy
  lowEnergy: [],
  energyFree: [],
  // Fibre
  highFibre: ["kostfiber"],
  sourceOfFibre: ["kostfiber"],
  increasedHighFibre: ["kostfiber"],
  reducedHighFibre: ["kostfiber"],
  // Sugars — withNoAddedSugars is disabled server-side (CalculatorService.cs):
  // it needs added sugar kept separate from natural sugar, and the nutrition
  // form only tracks total sugar now (single "Sukkerarter" field).
  lowSugars: ["sukkerarter"],
  sugarsFree: ["sukkerarter"],
  withNoAddedSugars: ["sukkerarter"],
  // Fat
  lowFat: ["fett"],
  fatFree: ["fett"],
  // Saturated fat (trans fat is part of the sat-fat calculation in the backend)
  lowSaturatedFat: ["mettede", "transfett"],
  saturatedFatFree: ["mettede", "transfett"],
  // Sodium / salt — all four claims are currently disabled server-side
  // (CalculatorService.cs). noAddedSodium specifically needs added salt kept
  // separate from natural salt to ever be re-enabled correctly; the nutrition
  // form only tracks total salt now, so re-enabling it needs that split back.
  lowSodium: ["salt"],
  veryLowSodium: ["salt"],
  sodiumFree: ["salt"],
  noAddedSodium: ["salt"],
  // Protein
  sourceOfProtein: ["protein"],
  highProtein: ["protein"],
};
