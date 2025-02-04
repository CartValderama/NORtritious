using Microsoft.AspNetCore.Identity;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool HasEfsaHealth { get; set; } = false;
    public bool HasEfsaNutrition { get; set; } = false;
    public bool HasNokkelhullet { get; set; } = false;
    public string ImageUrl { get; set; } = string.Empty;

    // Foreign Key for User (CreatedBy)
    public string UserId { get; set; } = string.Empty; // Foreign key for IdentityUser
    public IdentityUser CreatedByUser { get; set; } = null!; // Navigation property to IdentityUser

    // Foreign Key for NutritionalInfo
    public int NutritionalInfoId { get; set; }
    public NutritionalInfo NutritionalInfo { get; set; } = null!; // Navigation property to NutritionalInfo
}