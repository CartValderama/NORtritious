using Microsoft.AspNetCore.Identity;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool HasEfsaHealth { get; set; } = false;
    public string HasEfsaNutrition { get; set; } = string.Empty;
    public bool HasNokkelhullet { get; set; } = false;
    public string ImageUrl { get; set; } = string.Empty;

    // Nutrition Values
    public decimal Calories { get; set; }
    public decimal Fat { get; set; }
    public decimal SatFat { get; set; }
    public decimal Carbs { get; set; }
    public decimal NatSugar { get; set; }
    public decimal AddedSugar { get; set; }
    public decimal Fiber { get; set; }
    public decimal Protein { get; set; }
    public decimal Salt { get; set; }

    // Foreign Key for User (CreatedBy)
    public string UserId { get; set; } = string.Empty; // Foreign key for IdentityUser
    public IdentityUser CreatedByUser { get; set; } = null!; // Navigation property to IdentityUser
}