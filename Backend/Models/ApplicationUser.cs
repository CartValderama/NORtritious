using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? Name { get; set; } = string.Empty; // Tillater mellomrom
        public string? OrganizationNumber { get; set; }
        public string? ProfilePicture { get; set; }
    }
}