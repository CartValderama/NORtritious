namespace Backend.DTO
{
    public class CalculatorRequestDTO
    {
        // e.g. "Kategori1", "Kategori6", "Melk11a", "Kategori24b2"
        public string Category { get; set; } = string.Empty;

        // "solid" or "liquid"
        public string FoodType { get; set; } = string.Empty;

        // "energikcal" or "energikj"
        public string EnergyUnit { get; set; } = string.Empty;

        public NutritionInputDTO Nutrition { get; set; } = new();

        // Portion size of the product (g/ml) — used by claims whose condition needs a
        // "quantified portion" (e.g. the Beta-glucans post-meal-glucose claim). One value
        // for the whole product, since a real serving includes everything in it at once.
        public decimal PortionSize { get; set; }

        public List<HealthClaimInputDTO> Vitamins { get; set; } = new();
        public List<HealthClaimInputDTO> Minerals { get; set; } = new();
        public List<OtherClaimInputDTO> Others { get; set; } = new();
    }

    public class NutritionInputDTO
    {
        public decimal EnergyKcal { get; set; }
        public decimal EnergyKj { get; set; }
        public decimal Fat { get; set; }
        public decimal SaturatedFat { get; set; }
        public decimal TransFat { get; set; }

        // Used as total carbohydrates, or as total sugars depending on category
        public decimal Carbs { get; set; }

        public decimal NaturalSugars { get; set; }
        public decimal AddedSugars { get; set; }
        public decimal Fibre { get; set; }
        public decimal Protein { get; set; }

        // Total salt (natural + added)
        public decimal Salt { get; set; }

        // The portion of Salt that was added during production — used to verify
        // "uten tilsatt natrium/salt" actually means nothing was added, not just that
        // the total happens to be low.
        public decimal AddedSalt { get; set; }

        // Used for the "resistant starch" EFSA health claim, which requires resistant
        // starch to be at least 14% of total starch — not derivable from Carbs alone.
        public decimal TotalStarch { get; set; }
        public decimal ResistantStarch { get; set; }
    }

    public class HealthClaimInputDTO
    {
        // Must match a "nutrient" value in health_claims.json
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }

        // "mg" or "µg" — µg values are auto-converted to mg
        public string Unit { get; set; } = "mg";
    }

    public class OtherClaimInputDTO
    {
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
