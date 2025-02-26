using Microsoft.AspNetCore.Identity;
using Backend.Models;

namespace Backend.DAL.Seed;

public static class UserSeeder
{
    public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var adminEmail = "admin@example.com";
        var adminPassword = "Admin123!";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = adminEmail, // UserName må fortsatt være unikt
                Email = adminEmail,
                Name = "Admin Account",
                OrganizationNumber = ""
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }

    public static async Task SeedProducerUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var producerEmail = "producer@example.com";
        var producerPassword = "Producer123!";

        if (await userManager.FindByEmailAsync(producerEmail) == null)
        {
            var producerUser = new ApplicationUser
            {
                UserName = producerEmail,
                Email = producerEmail,
                Name = "Producer Account",
                OrganizationNumber = "123456789"
            };

            var result = await userManager.CreateAsync(producerUser, producerPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(producerUser, "Producer");
            }
        }
    }

    public static async Task SeedResearcherUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var researcherEmail = "researcher@example.com";
        var researcherPassword = "Researcher123!";

        if (await userManager.FindByEmailAsync(researcherEmail) == null)
        {
            var researcherUser = new ApplicationUser
            {
                UserName = researcherEmail,
                Email = researcherEmail,
                Name = "Researcher Account",
                OrganizationNumber = "123456789"
            };

            var result = await userManager.CreateAsync(researcherUser, researcherPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(researcherUser, "Researcher");
            }
        }
    }
}