using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Backend.DAL;
using Backend.Models;

namespace Backend.DAL.Seed;

public static class ProductSeeder
{
    public static async Task SeedProductsAsync(IServiceProvider serviceProvider)
    {
        var db = serviceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        if (await db.Products.AnyAsync())
            return;

        var producer = await userManager.FindByEmailAsync("producer@example.com");
        if (producer == null)
            return;

        var products = new List<Product>
        {
            new Product
            {
                Name = "Whole Milk",
                Group = "Dairy",
                Type = "Milk",
                HasEfsaHealth = "No",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = false,
                ImageUrl = "",
                Calories = 61, Fat = 3.3m, SatFat = 2.1m, Carbs = 4.8m,
                NatSugar = 4.8m, AddedSugar = 0, Fiber = 0, Protein = 3.2m, Salt = 0.1m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Skimmed Milk",
                Group = "Dairy",
                Type = "Milk",
                HasEfsaHealth = "No",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 35, Fat = 0.1m, SatFat = 0.1m, Carbs = 5.0m,
                NatSugar = 5.0m, AddedSugar = 0, Fiber = 0, Protein = 3.4m, Salt = 0.1m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Greek Yogurt",
                Group = "Dairy",
                Type = "Yogurt",
                HasEfsaHealth = "No",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 59, Fat = 0.4m, SatFat = 0.3m, Carbs = 3.6m,
                NatSugar = 3.6m, AddedSugar = 0, Fiber = 0, Protein = 10m, Salt = 0.06m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Cheddar Cheese",
                Group = "Dairy",
                Type = "Cheese",
                HasEfsaHealth = "No",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = false,
                ImageUrl = "",
                Calories = 403, Fat = 33m, SatFat = 21m, Carbs = 1.3m,
                NatSugar = 0.5m, AddedSugar = 0, Fiber = 0, Protein = 25m, Salt = 1.8m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Chicken Breast",
                Group = "Meat",
                Type = "Poultry",
                HasEfsaHealth = "No",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 110, Fat = 1.2m, SatFat = 0.3m, Carbs = 0,
                NatSugar = 0, AddedSugar = 0, Fiber = 0, Protein = 24m, Salt = 0.07m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Salmon Fillet",
                Group = "Fish",
                Type = "Fish",
                HasEfsaHealth = "Yes",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 208, Fat = 13m, SatFat = 3.1m, Carbs = 0,
                NatSugar = 0, AddedSugar = 0, Fiber = 0, Protein = 20m, Salt = 0.06m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Whole Wheat Bread",
                Group = "Bread & Grains",
                Type = "Bread",
                HasEfsaHealth = "Yes",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 247, Fat = 3.4m, SatFat = 0.6m, Carbs = 41m,
                NatSugar = 3.5m, AddedSugar = 1.0m, Fiber = 7m, Protein = 13m, Salt = 1.0m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Rolled Oats",
                Group = "Bread & Grains",
                Type = "Cereal",
                HasEfsaHealth = "Yes",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 368, Fat = 7m, SatFat = 1.4m, Carbs = 58m,
                NatSugar = 1.0m, AddedSugar = 0, Fiber = 10m, Protein = 13m, Salt = 0.01m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Orange Juice",
                Group = "Beverages",
                Type = "Juice",
                HasEfsaHealth = "Yes",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = false,
                ImageUrl = "",
                Calories = 45, Fat = 0.2m, SatFat = 0, Carbs = 10m,
                NatSugar = 8.4m, AddedSugar = 0, Fiber = 0.2m, Protein = 0.7m, Salt = 0.01m,
                UserId = producer.Id
            },
            new Product
            {
                Name = "Broccoli",
                Group = "Vegetables",
                Type = "Vegetable",
                HasEfsaHealth = "Yes",
                HasEfsaNutrition = "Yes",
                HasNokkelhullet = true,
                ImageUrl = "",
                Calories = 34, Fat = 0.4m, SatFat = 0.1m, Carbs = 7m,
                NatSugar = 1.7m, AddedSugar = 0, Fiber = 2.6m, Protein = 2.8m, Salt = 0.03m,
                UserId = producer.Id
            }
        };

        await db.Products.AddRangeAsync(products);
        await db.SaveChangesAsync();
    }
}
