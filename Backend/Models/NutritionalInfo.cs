public class NutritionalInfo
{
    public int NutritionalInfoId { get; set; }
    public decimal Calories { get; set; }
    public decimal Fat { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fiber { get; set; }
    public decimal Sugar { get; set; }

    // Foreign key to Product
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}