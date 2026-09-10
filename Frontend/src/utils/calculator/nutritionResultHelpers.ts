import { formatNoNumber, type NutritionValues } from "./nutritionFormFields";
import type { EfsaPanelValues } from "../../stores/calculatorFormStore";


// translateSubstanceName lived here, mapping "Calcium" to "Kalsium" from the picker's own
// option list. The backend sets Nutrient to the Norwegian name itself now (NutrientLabels),
// so the card, the saved product and the report can't disagree about what to call it.


export const MEETS_REQUIREMENT = "Oppfyller gitt krav";

// Openings CalculatorService.cs uses when it deliberately reaches no verdict: an input it
// needs is missing (typically Porsjonsstørrelse, for a threshold stated per portion), or the
// condition isn't arithmetic at all. These are not failures and must not be shown as ones.
// The product hasn't fallen short of anything, it just hasn't been judged.
const UNDETERMINED_PREFIXES = [
  "Kan ikke beregnes automatisk",
  "Kan ikke vurderes automatisk",
];

export type ClaimStatus = "met" | "notMet" | "undetermined";

export const getClaimStatus = (meetsRequirement?: string): ClaimStatus => {
  const text = meetsRequirement ?? "";
  if (text === MEETS_REQUIREMENT) return "met";
  if (UNDETERMINED_PREFIXES.some((p) => text.startsWith(p))) return "undetermined";
  return "notMet";
};

// The resistant starch claim's Amount string trails with a "(NN %)" ratio
// (e.g. "1 g resistent stivelse av 1 g total stivelse (100 %)") — stripped
// for display since the percentage isn't meant to be shown.
export const stripPercentageSuffix = (text?: string | null): string =>
  (text ?? "").replace(/\s*\([\d.,]+\s*%\)\s*$/, "").trim();

export interface HealthClaim {
  nutrient?: string;
  amount?: string;
  pastand?: string;
  // The EU-mandated usage condition for this specific claim (e.g. a required
  // daily intake) — can't be verified by the calculator (it's about consumer
  // behavior, not product composition), so it must be shown to whoever is
  // preparing the label instead of just implied by a pass/fail result.
  vilkaarForBruk?: string;
  vilkaarOgBegrensninger?: string;
  sourceUrl?: string;
  efsaQuestionUrl?: string;
  efsaQuestion?: string;
  efsaQuestionTitle?: string;
  legislationReference?: string;
  meetsRequirement?: string;
}

// One rule, evaluated by the backend. Nøkkelhullet criteria and EFSA nutrition claims both
// arrive in this shape: the two regimes decide different things, but they answer in the same
// terms, so they say it in the same words. Mirrors RuleAssessmentDTO.
// buildClaimStatistic lived here, building "Produktet inneholder 7 g kostfiber per 100 g"
// from a local map of which fields each claim reads. The response carries actualValue and
// thresholdUnit for every claim now, so the card states the figure straight from the number
// the verdict was reached on.

export interface RuleAssessment {
  key: string;
  label: string;
  passed: boolean;
  actualValue: number;
  actualUnit: string;
  comparator: string;
  thresholdValue: number;
  thresholdUnit: string;
  explanation: string;
  note?: string;
}

export type NokkelhulletRequirement = RuleAssessment;
export type EfsaNutritionClaimResult = RuleAssessment;

interface HealthClaimsResult {
  efsaHealthClaims?: HealthClaim[];
  ingredientHealthClaims?: HealthClaim[];
}

// Combines carbohydrate claims and ingredient-based claims (vitamins, minerals, other
// substances), keeping only the ones explicitly verified as met — anything else (failed,
// or unverifiable e.g. missing portion size / requires body weight) must not be shown as
// if it qualifies.
export const getVisibleHealthClaims = (
  result: HealthClaimsResult,
): HealthClaim[] =>
  [...(result.efsaHealthClaims || []), ...(result.ingredientHealthClaims || [])].filter(
    (c) => getClaimStatus(c.meetsRequirement) === "met",
  );

// Same combined list as getVisibleHealthClaims, but unfiltered — every substance the user
// added, whether it met the requirement or not. meetsRequirement carries the reason for a
// miss (e.g. "trenger minst 6 g per 100 g — produktet har 4 g"), so a failed substance can
// be shown with why it failed instead of silently disappearing from the results.
export const getAllHealthClaims = (result: HealthClaimsResult): HealthClaim[] => [
  ...(result.efsaHealthClaims || []),
  ...(result.ingredientHealthClaims || []),
];

// Labels for the nutrition-table fields, used to build the per-claim statistic line.
export const FIELD_LABELS: Record<string, string> = {
  fett: "Fett",
  mettede: "Mettede fettsyrer",
  transfett: "Transfett",
  karbohydrat: "Karbohydrat",
  sukkerarter: "Sukkerarter",
  kostfiber: "Kostfiber",
  protein: "Protein",
  salt: "Salt",
};

// Builds a natural lead-in sentence ("Produktet inneholder 3 g kostfiber per 100 g")
// for the fields a given claim depends on, so it reads as one sentence together with
// the claim's own met/not-met text instead of a bare "Label: value" fragment.
export const buildClaimStatistic = (
  claimKey: string,
  nutrition: NutritionValues | null | undefined,
  claimFields: Record<string, string[]>,
): string | null => {
  if (!nutrition) return null;

  // Energy claims (lowEnergy/energyFree) aren't in EFSA_CLAIM_FIELDS — energy
  // isn't a regular nutrition-table field, it's energikcal/energikj on its
  // own, and only one of the two is ever filled in (whichever unit the form
  // was set to) — so they need their own branch instead of the generic
  // field-list lookup below, which would otherwise silently return nothing.
  if (claimKey === "lowEnergy" || claimKey === "energyFree") {
    const kcalPart =
      nutrition.energikcal !== "" ? `${formatNoNumber(Number(nutrition.energikcal) || 0)} kcal` : "";
    const kjPart =
      nutrition.energikj !== "" ? `${formatNoNumber(Number(nutrition.energikj) || 0)} kJ` : "";
    const energy = [kcalPart, kjPart].filter(Boolean).join(" / ");
    return energy ? `Produktet inneholder ${energy} energi per 100 g` : null;
  }

  const fields = claimFields[claimKey] || [];
  if (fields.length === 0) return null;
  const parts = fields.map(
    (f) => `${formatNoNumber(Number(nutrition[f]) || 0)} g ${(FIELD_LABELS[f] || f).toLowerCase()}`,
  );
  const joined =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}`
      : parts[0];
  return `Produktet inneholder ${joined} per 100 g`;
};

// getEfsaClaimDisplay lived here: a third copy of every EFSA threshold, used only to render
// actual-vs-limit in the report. The backend now returns those figures on
// EfsaNutritionClaimResults, alongside the verdict they produced, so a limit can no longer be
// changed in one place and quoted from another.
//
// getApplicableClaims, ApplicableClaim, LIQUID_ONLY_CLAIMS and SOLID_ONLY_CLAIMS went with it.
// Which claims apply to a category and food type is the backend's answer now, and it arrives
// as that same array.



interface ResultSummaryInput {
  hasNokkelhullet?: boolean;
  nokkelhulletRequirements?: NokkelhulletRequirement[];
  efsaNutritionClaims?: string[];
  efsaNutritionClaimResults?: EfsaNutritionClaimResult[];
  efsaHealthClaims?: { meetsRequirement?: string }[];
  ingredientHealthClaims?: { meetsRequirement?: string }[];
}

export interface ResultStats {
  nokkelhulletPassed: boolean;
  nokkelhulletPassedCount: number;
  nokkelhulletTotalCount: number;
  efsaMetCount: number;
  efsaTotalCount: number;
  healthClaimsMetCount: number;
  healthClaimsTotalCount: number;
}

// The three headline numbers behind the "Resultat" summary — shared by the plain-text
// paragraph (buildResultSummary below) and the three stat boxes in NutritionResult.jsx,
// so both stay in sync off one calculation instead of two.
// Every count comes off the response. The met counts used to be filtered against a
// separately-derived "applicable" list, which is how a claim could once be counted as met
// without being counted in the total. Both numbers now come from the same array.
export const buildResultStats = (result: ResultSummaryInput): ResultStats => {
  const requirements = result.nokkelhulletRequirements ?? [];
  const nutritionClaims = result.efsaNutritionClaimResults ?? [];

  const healthClaims = [
    ...(result.efsaHealthClaims || []),
    ...(result.ingredientHealthClaims || []),
  ];

  return {
    nokkelhulletPassed: result.hasNokkelhullet === true,
    nokkelhulletPassedCount: requirements.filter((r) => r.passed).length,
    nokkelhulletTotalCount: requirements.length,
    efsaMetCount: nutritionClaims.filter((c) => c.passed).length,
    efsaTotalCount: nutritionClaims.length,
    healthClaimsMetCount: healthClaims.filter(
      (c) => getClaimStatus(c.meetsRequirement) === "met",
    ).length,
    healthClaimsTotalCount: healthClaims.length,
  };
};

// Overview card verdicts (NutritionResult.jsx) — the ring and accordion badge
// already carry the raw numbers, so these say what that number actually means
// in practice instead of just repeating it.
export const buildNokkelhulletVerdict = (stats: ResultStats): string => {
  if (stats.nokkelhulletTotalCount === 0)
    return "Ingen krav for denne kategorien";
  return stats.nokkelhulletPassedCount === stats.nokkelhulletTotalCount
    ? "Kan merkes med Nøkkelhullet"
    : "Kan ikke merkes med Nøkkelhullet";
};

export const buildEfsaVerdict = (stats: ResultStats): string => {
  if (stats.efsaTotalCount === 0)
    return "Ingen påstander mulig for denne kategorien";
  if (stats.efsaMetCount === 0) return "Ingen ernæringspåstander kan brukes";
  if (stats.efsaMetCount === stats.efsaTotalCount)
    return "Alle ernæringspåstander kan brukes";
  return `${stats.efsaMetCount} påstand${stats.efsaMetCount === 1 ? "" : "er"} kan brukes på pakningen`;
};

export const buildHealthClaimsVerdict = (stats: ResultStats): string => {
  if (stats.healthClaimsMetCount === 0)
    return "Ingen helsepåstander kan utledes ennå";
  return `${stats.healthClaimsMetCount} potensiell${stats.healthClaimsMetCount === 1 ? "" : "e"} helsepåstand${stats.healthClaimsMetCount === 1 ? "" : "er"}`;
};

// Template for the summary line under the "Resultat" heading. Longer/more detailed
// than a bare pass/fail line: spells out the Nøkkelhullet requirement count (like
// NokkelhulletSection's own breakdown) and mentions EFSA helsepåstander alongside
// ernæringspåstander, instead of only the two-sentence summary.
export const buildResultSummary = (result: ResultSummaryInput): string => {
  const {
    nokkelhulletPassed,
    nokkelhulletPassedCount,
    nokkelhulletTotalCount,
    efsaMetCount,
    efsaTotalCount,
    healthClaimsMetCount,
  } = buildResultStats(result);

  return (
    `Nøkkelhullet er ${nokkelhulletPassed ? "oppfylt" : "ikke oppfylt"} for denne kategorien` +
    (nokkelhulletTotalCount > 0
      ? ` (${nokkelhulletPassedCount} av ${nokkelhulletTotalCount} krav oppfylt).`
      : ".") +
    ` ${efsaMetCount} av ${efsaTotalCount} mulige EFSA-ernæringspåstander er oppfylt, ` +
    `og ${healthClaimsMetCount} EFSA-helsepåstand${healthClaimsMetCount === 1 ? "" : "er"} kan brukes for produktet.`
  );
};

// Border/header-fill/badge colors for a result section all derive from the same
// tri-state tone (every requirement met / at least one missed / nothing to
// evaluate) instead of five separate parallel functions each re-deriving the
// same branch.
export interface ClaimToneColors {
  border: string;
  headerBg: string;
  badgeBg: string;
  badgeColor: string;
}

const CLAIM_TONE_COLORS: Record<"pass" | "fail" | "none", ClaimToneColors> = {
  pass: {
    border: "#a3cfbb",
    headerBg: "#eaf6ee",
    badgeBg: "#d1e7dd",
    badgeColor: "#0a3622",
  },
  fail: {
    border: "#f1aeb5",
    headerBg: "#fdeef0",
    badgeBg: "#f8d7da",
    badgeColor: "#58151c",
  },
  none: {
    border: "#dee2e6",
    headerBg: "#f8f9fa",
    badgeBg: "#e2e3e5",
    badgeColor: "#41464b",
  },
};

const claimTone = (passedCount: number, totalCount: number): "pass" | "fail" | "none" => {
  if (totalCount === 0) return "none";
  return passedCount === totalCount ? "pass" : "fail";
};

export const claimColors = (passedCount: number, totalCount: number): ClaimToneColors =>
  CLAIM_TONE_COLORS[claimTone(passedCount, totalCount)];

export interface ClaimBadge {
  text: string;
  backgroundColor: string;
  color: string;
}

// Full success (or full failure) is a single badge in the matching tone; a mix
// splits into two badges — one green with the passed count, one red with the
// failed count — so both numbers are visible at a glance without opening the
// accordion, and without a text label repeating what the color already says.
export const claimBadges = (passedCount: number, totalCount: number): ClaimBadge[] => {
  if (totalCount === 0) return [];
  const pass = CLAIM_TONE_COLORS.pass;
  const fail = CLAIM_TONE_COLORS.fail;

  if (passedCount === totalCount)
    return [{ text: `${totalCount}`, backgroundColor: pass.badgeBg, color: pass.badgeColor }];
  if (passedCount === 0)
    return [{ text: `${totalCount}`, backgroundColor: fail.badgeBg, color: fail.badgeColor }];
  return [
    { text: `${passedCount}`, backgroundColor: pass.badgeBg, color: pass.badgeColor },
    {
      text: `${totalCount - passedCount}`,
      backgroundColor: fail.badgeBg,
      color: fail.badgeColor,
    },
  ];
};

// Helsepåstander only ever lists claims that qualify (no "failed" list to
// compare against), so it gets a two-state grey/blue treatment instead — blue
// matches EFSA's own accent color used elsewhere on the result page.
const HEALTH_CLAIMS_TONE_COLORS: Record<"met" | "none", ClaimToneColors> = {
  met: {
    border: "#9ec5fe",
    headerBg: "#eff6ff",
    badgeBg: "#cfe2ff",
    badgeColor: "#052c65",
  },
  none: CLAIM_TONE_COLORS.none,
};

export const healthClaimsColors = (metCount: number): ClaimToneColors =>
  HEALTH_CLAIMS_TONE_COLORS[metCount > 0 ? "met" : "none"];

// Same split as claimBadges (met badge + unsatisfied badge when mixed), but the met badge
// uses Helsepåstander's own blue tone instead of claimBadges' green — this section already
// reads as blue everywhere else (healthClaimsColors), so its accordion badge should match
// instead of borrowing Nøkkelhullet/EFSA's pass/fail green.
export const healthClaimsBadges = (metCount: number, totalCount: number): ClaimBadge[] => {
  if (totalCount === 0) return [];
  const met = HEALTH_CLAIMS_TONE_COLORS.met;
  const fail = CLAIM_TONE_COLORS.fail;

  if (metCount === totalCount)
    return [{ text: `${totalCount}`, backgroundColor: met.badgeBg, color: met.badgeColor }];
  if (metCount === 0)
    return [{ text: `${totalCount}`, backgroundColor: fail.badgeBg, color: fail.badgeColor }];
  return [
    { text: `${metCount}`, backgroundColor: met.badgeBg, color: met.badgeColor },
    {
      text: `${totalCount - metCount}`,
      backgroundColor: fail.badgeBg,
      color: fail.badgeColor,
    },
  ];
};

// Ring percentages for the Nøkkelhullet/EFSA overview cards — pure derivations
// off the same stats object both cards already read their counts from.
export const getNokkelhulletPercentage = (stats: ResultStats): number =>
  stats.nokkelhulletTotalCount > 0
    ? (stats.nokkelhulletPassedCount / stats.nokkelhulletTotalCount) * 100
    : stats.nokkelhulletPassed
      ? 100
      : 0;

export const getEfsaPercentage = (stats: ResultStats): number =>
  stats.efsaTotalCount > 0 ? (stats.efsaMetCount / stats.efsaTotalCount) * 100 : 0;

// The product payload for "Lagre produkt" on the calculator.
export const buildProductSubmitPayload = (
  calcResult: HealthClaimsResult | null | undefined,
  hasNokkelhullet: boolean,
  hasEfsaNutrition: string[] | boolean | null,
  nutrition: NutritionValues,
  categoryKey: string,
  foodType: string,
  efsaValues: EfsaPanelValues,
) => {
  // Every satisfied claim — both the carbohydrate/fibre-based ones
  // (efsaHealthClaims) and the ones from substances added in "Kilde til
  // annet" (ingredientHealthClaims, e.g. vitamins/minerals) — not just the
  // first efsaHealthClaims entry. Saving only the first one meant a product
  // with both a satisfied starch claim and satisfied vitamin/mineral claims
  // only ever showed the starch claim on the product page.
  const satisfiedHealthClaims = getVisibleHealthClaims(calcResult ?? {});
  const hasEfsaHealthText = satisfiedHealthClaims
    .map(
      (claim) =>
        `<strong>${claim.nutrient ?? ""} Helsepåstand:</strong>\n${claim.meetsRequirement ?? ""}\n${claim.pastand ?? ""}`,
    )
    .join("\n");
  // Backend's ProductDTO.HasEfsaNutrition is a plain string (comma-separated list,
  // parsed back apart by NutritionClaimsUL.tsx) — hasEfsaNutrition itself is set
  // straight from the calculate response's efsaNutritionClaims array
  // (NutritionForm.jsx), so sending it as-is here is a string[]/boolean/null that
  // fails JSON model binding into that string property with a 400, silently
  // breaking every save.
  const hasEfsaNutritionText = Array.isArray(hasEfsaNutrition)
    ? hasEfsaNutrition.join(", ")
    : "";
  return {
    hasNokkelhullet,
    hasEfsaNutrition: hasEfsaNutritionText,
    categoryKey,
    foodType,
    hasEfsaHealth: hasEfsaHealthText,
    calories:
      nutrition.energikcal !== "" ? nutrition.energikcal : nutrition.energikj,
    fat: nutrition.fett,
    satFat: nutrition.mettede,
    carbs: nutrition.karbohydrat,
    // Product.NatSugar/AddedSugar are still two separate saved columns, but the
    // form no longer collects that split — the full amount goes to natSugar
    // (not addedSugar) so the saved product's label doesn't assert "all of
    // this is added sugar" without evidence for it.
    //
    // sukkerarter/protein are hidden inputs (blank, never touched) for
    // categories where they're chemically zero or claims can't apply
    // (ZERO_SUGAR_CATEGORIES/NO_PROTEIN_CATEGORIES in nutritionFormFields.ts)
    // — sending "" straight through used to 400 every save for those
    // categories, since Product.NatSugar/Protein are decimal columns that
    // can't parse an empty string.
    natSugar: nutrition.sukkerarter || "0",
    addedSugar: "0",
    fiber: nutrition.kostfiber || "0",
    protein: nutrition.protein || "0",
    salt: Number(nutrition.salt) || 0,
    // "Kilde til Annet"/helsepåstander panel inputs — previously not saved at
    // all, so every edit silently dropped the starch/portion size/added
    // substances back to blank even though the rest of the form restored.
    portionSize: efsaValues.portionSize || "0",
    totalStarch: efsaValues.totalStarch || "0",
    resistantStarch: efsaValues.resistantStarch || "0",
    otherSubstancesJson: JSON.stringify(efsaValues.otherSubstances || []),
  };
};

// getEnergyMismatchWarning and getEnergyFormulaWarning lived here. They used the energy
// conversion factors from Annex XIV to Regulation (EU) No 1169/2011, which the backend also
// holds for the saturated-fat claim, so the two could have disagreed about what a gram of
// fat is worth. The response carries them as `warnings` now.

