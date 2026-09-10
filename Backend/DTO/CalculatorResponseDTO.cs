namespace Backend.DTO
{
    public class CalculatorResponseDTO
    {
        // null means the category has no Nøkkelhullet requirements defined
        public bool? HasNokkelhullet { get; set; }

        // The per-requirement breakdown behind HasNokkelhullet: which nutrient, what was
        // entered, what the limit is, and whether it cleared. HasNokkelhullet is the AND of
        // Passed across this list, so the two can't disagree.
        //
        // Empty for a category with no thresholds and for the always-pass categories.
        public List<NokkelhulletRequirementDTO> NokkelhulletRequirements { get; set; } = new();

        // List of passing EFSA nutrition claim names, e.g. "Lavt Fettinnhold"
        public List<string> EfsaNutritionClaims { get; set; } = new();

        // Every EFSA nutrition claim offered for this category and food type, met or not,
        // with the numbers each verdict was reached on. EfsaNutritionClaims is the Name of
        // the entries where Met is true.
        public List<EfsaNutritionClaimDTO> EfsaNutritionClaimResults { get; set; } = new();

        public List<HealthClaimResultDTO> EfsaHealthClaims { get; set; } = new();

        // Health claims for user-selected vitamins, minerals, and other substances
        public List<HealthClaimResultDTO> IngredientHealthClaims { get; set; } = new();

        // Plausibility warnings about the entered figures, e.g. an energy value the macros
        // can't account for. Nothing is blocked by them; they flag a likely data-entry
        // mistake so a verdict isn't trusted on numbers that don't add up.
        //
        // Computed here because the check uses the energy conversion factors in Annex XIV to
        // Regulation (EU) No 1169/2011, which this project already holds for the saturated-fat
        // claim. Written on both sides they could disagree about what a gram of fat is worth.
        public List<string> Warnings { get; set; } = new();
    }

    // One rule, evaluated against what was entered. Nøkkelhullet criteria and EFSA nutrition
    // claims both produce this: the two regimes decide different things, but they answer in
    // the same terms, so they say it in the same words.
    //
    // The rule *definitions* stay different in kind and should. Nøkkelhullet's are data
    // (CategoryThreshold: a nullable decimal per nutrient, uniform enough for one evaluator),
    // while EFSA's are code (the Claim* predicates), because "6 g per 100 g or 3 g per
    // 100 kcal" and "a gram limit and a share of energy" don't fit in a table of numbers.
    // That difference is real. The difference in how they reported their results wasn't.
    public abstract class RuleAssessmentDTO
    {
        // Stable identifier for the rule, e.g. "maxFat" or "lowSugars". Lets a caller key off
        // the rule itself rather than off Norwegian display text.
        public string Key { get; set; } = string.Empty;

        // What the rule is about: a nutrient for Nøkkelhullet ("Sukkerarter"), a claim name
        // for EFSA ("Sukkerfri"). For EFSA this also matches the EfsaNutritionClaims entries.
        public string Label { get; set; } = string.Empty;

        public bool Passed { get; set; }

        public decimal ActualValue { get; set; }
        public string ActualUnit { get; set; } = string.Empty;

        // "≤" or "≥"
        public string Comparator { get; set; } = string.Empty;
        public decimal ThresholdValue { get; set; }

        // Same as ActualUnit for most rules. They differ where the two are stated on
        // different bases, e.g. a fibre claim cleared on "g per 100 kcal".
        public string ThresholdUnit { get; set; } = string.Empty;

        // The Norwegian sentence shown with the result. Which one applies is decided by
        // Passed, so a caller renders Explanation without branching.
        //
        // It lives here because it quotes the same limits the rule checked. Written on both
        // sides, the copy could state one number while the verdict used another, and it did
        // until Sukkerfri was corrected from 5 g to 0,5 g in three separate places.
        public string Explanation { get; set; } = string.Empty;

        // Set when the rule covers something narrower than the number compared against it,
        // e.g. a cap written for tilsatte sukkerarter checked against total sugars. States
        // what the rule covers and what was compared, and leaves the reading to whoever gets
        // the report rather than drawing a conclusion about the product. Null when there is
        // nothing to qualify, which is the usual case.
        public string? Note { get; set; }
    }

    public class NokkelhulletRequirementDTO : RuleAssessmentDTO { }

    public class EfsaNutritionClaimDTO : RuleAssessmentDTO { }

    public class HealthClaimResultDTO
    {
        public string Nutrient { get; set; } = string.Empty;
        public string Amount { get; set; } = string.Empty;

        // "Oppfyller gitt krav", "Oppfyller ikke gitt krav", or "Kan ikke beregnes automatisk"
        public string MeetsRequirement { get; set; } = string.Empty;

        // Fields from the EU Health Claims register entry (or health_claims.json fallback)
        public string Naeringsmiddel { get; set; } = string.Empty;
        public string Pastand { get; set; } = string.Empty;
        public string VilkaarForBruk { get; set; } = string.Empty;
        public string VilkaarOgBegrensninger { get; set; } = string.Empty;

        // The EU Regulation this specific claim is authorised under, e.g.
        // "Commission Regulation (EU) 432/2012 of 16/05/2012" — not the same for every claim.
        public string LegislationReference { get; set; } = string.Empty;
        public string SourceUrl { get; set; } = string.Empty;

        // The EFSA scientific opinion the claim is based on, e.g. "2011;9(6):2249"
        public string EfsaQuestion { get; set; } = string.Empty;
        public string EfsaQuestionUrl { get; set; } = string.Empty;

        // Short human-readable title for the opinion behind EfsaQuestionUrl (see
        // CalculatorService.EfsaOpinionTitles) — falls back to the bare citation
        // (EfsaQuestion) when no title is mapped for this claim.
        public string EfsaQuestionTitle { get; set; } = string.Empty;
    }
}
