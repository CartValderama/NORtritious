// Which nutrition-table field keys each EFSA claim depends on (mirrors the
// Claim* predicates in CalculatorService.cs). EFSA claims apply to every category,
// so this is not keyed by category — only by claim.
// Results are still scoped to energy + fiber; the extra entries here only control
// which input fields are shown so producers can fill them in ahead of time.
export const EFSA_CLAIM_FIELDS = {
  // Energy
  lowEnergy: [],
  energyFree: [],
  // Fibre
  highFibre: ["kostfiber"],
  sourceOfFibre: ["kostfiber"],
  increasedHighFibre: ["kostfiber"],
  reducedHighFibre: ["kostfiber"],
  // Sugars
  lowSugars: ["naturligSukker", "hvoravSukkerarter"],
  withNoAddedSugars: ["hvoravSukkerarter"],
  // Fat
  lowFat: ["fett"],
  fatFree: ["fett"],
  // Saturated fat (trans fat is part of the sat-fat calculation in the backend)
  lowSaturatedFat: ["mettede", "transfett"],
  saturatedFatFree: ["mettede", "transfett"],
  // Sodium / salt
  lowSodium: ["naturligSalt"],
  veryLowSodium: ["naturligSalt"],
  sodiumFree: ["naturligSalt"],
  noAddedSodium: ["naturligSalt", "tilsattSalt"],
  // Protein
  sourceOfProtein: ["protein"],
  highProtein: ["protein"],
};
