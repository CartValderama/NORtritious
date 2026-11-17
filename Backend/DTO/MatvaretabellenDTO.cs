namespace Backend.DTO
{
    // Full nutrient breakdown for one food, already mapped onto the calculator's
    // own nutrition-table fields (per 100 g, matching Matvaretabellen's own basis).
    // Used both for search result rows and single-food lookup.
    public class MatvaretabellenFoodDetailDTO
    {
        public string FoodId { get; set; } = string.Empty;
        public string FoodName { get; set; } = string.Empty;
        public string FoodGroupId { get; set; } = string.Empty;
        public double EnergyKcal { get; set; }
        public double EnergyKj { get; set; }
        public double Fat { get; set; }
        public double SaturatedFat { get; set; }
        public double TransFat { get; set; }
        public double Carbs { get; set; }
        public double Sugars { get; set; }
        public double Fibre { get; set; }
        public double Protein { get; set; }
        public double Salt { get; set; }
        public double Starch { get; set; }

        // The five the unsaturated-fat and omega-3 claims read. Matvaretabellen states all
        // of them in grams, which is the unit the form asks for, so nothing is converted.
        public double MonounsaturatedFat { get; set; }
        public double PolyunsaturatedFat { get; set; }
        public double AlphaLinolenicAcid { get; set; }
        public double EicosapentaenoicAcid { get; set; }
        public double DocosahexaenoicAcid { get; set; }

        // Feed the helsepåstander panel's kilder rather than the nutrition table, each in
        // the unit its own claim threshold is written in: calcium mg, vitamin D µg,
        // vitamin C mg, linoleic acid g. Nothing is converted at either end.
        public double Calcium { get; set; }
        public double VitaminD { get; set; }
        public double VitaminC { get; set; }
        public double LinoleicAcid { get; set; }
    }
}
