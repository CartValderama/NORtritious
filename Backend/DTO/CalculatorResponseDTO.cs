namespace Backend.DTO
{
    public class CalculatorResponseDTO
    {
        // null means the category has no Nøkkelhullet requirements defined
        public bool? HasNokkelhullet { get; set; }

        // List of passing EFSA nutrition claim names, e.g. "Lavt Fettinnhold"
        public List<string> EfsaNutritionClaims { get; set; } = new();

        public List<HealthClaimResultDTO> EfsaHealthClaims { get; set; } = new();

        // Health claims for user-selected vitamins, minerals, and other substances
        public List<HealthClaimResultDTO> IngredientHealthClaims { get; set; } = new();
    }

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
