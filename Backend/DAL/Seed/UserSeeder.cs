using Microsoft.AspNetCore.Identity;

namespace Backend.DAL.Seed;

public static class UserSeeder
{
    public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var adminEmail = "admin@example.com";
        var adminPassword = "Admin123!";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var adminUser = new IdentityUser { UserName = adminEmail, Email = adminEmail };
            var result = await userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }

    public static async Task SeedProducerUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var producerEmail = "producer@example.com";
        var producerPassword = "Producer123!";

        if (await userManager.FindByEmailAsync(producerEmail) == null)
        {
            var producerUser = new IdentityUser { UserName = producerEmail, Email = producerEmail };
            var result = await userManager.CreateAsync(producerUser, producerPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(producerUser, "Producer");
            }
        }
    }

    public static async Task SeedResearcherUserAsync(IServiceProvider serviceProvider)
    {
        var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var researcherEmail = "researcher@example.com";
        var researcherPassword = "Researcher123!";

        if (await userManager.FindByEmailAsync(researcherEmail) == null)
        {
            var researcherUser = new IdentityUser { UserName = researcherEmail, Email = researcherEmail };
            var result = await userManager.CreateAsync(researcherUser, researcherPassword);

            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(researcherUser, "Researcher");
            }
        }
    }
}