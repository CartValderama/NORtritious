using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    { }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // One-to-One relationship between Product and NutritionalInfo
        modelBuilder.Entity<Product>()
            .HasOne(p => p.NutritionalInfo)
            .WithOne(n => n.Product)
            .HasForeignKey<NutritionalInfo>(n => n.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  // Enable cascading delete

        modelBuilder.Entity<Product>()
            .HasOne(p => p.CreatedByUser)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Avoid accidental user deletions affecting products
    }
}