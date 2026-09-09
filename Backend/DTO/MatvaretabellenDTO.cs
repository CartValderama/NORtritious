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
    }
}
