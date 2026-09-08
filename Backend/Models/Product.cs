using Microsoft.AspNetCore.Identity;
using Backend.Models;

public class Product
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    // Backend category key (e.g. "Kategori8a") and the calculator's foodType
    // ("solid"/"liquid") the product was calculated with — needed to restore
    // the calculator's dropdown state and nutrition unit when editing a saved
    // product. Group/Type above stay as rendered display strings for the
    // product pages; these are the machine-readable equivalents.
    public string CategoryKey { get; set; } = string.Empty;
    public string FoodType { get; set; } = string.Empty;
    public string HasEfsaHealth { get; set; } = string.Empty;
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

    // The "Kilde til Annet"/helsepåstander calculator inputs — needed to
    // restore that panel (and the health claims it derives) when editing a
    // saved product, same reason CategoryKey/FoodType exist above. Without
    // these, every edit silently dropped back to a blank panel even though
    // the rest of the form restored correctly.
    public decimal PortionSize { get; set; }
    public decimal TotalStarch { get; set; }
    public decimal ResistantStarch { get; set; }
    // JSON-encoded array of {name, amount} — same shape as the frontend's
    // OtherSubstance[] (EfsaPanelValues.otherSubstances in calculatorFormStore.ts).
    public string OtherSubstancesJson { get; set; } = "[]";

    // Foreign Key for User (CreatedBy)
    public string UserId { get; set; } = string.Empty; // Foreign key for IdentityUser
    public ApplicationUser CreatedByUser { get; set; } = null!; // Navigation property to IdentityUser
}