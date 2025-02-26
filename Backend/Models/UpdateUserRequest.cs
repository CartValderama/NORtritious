namespace Backend.Models
{
    public class UpdateUserRequest
    {
        public string Name { get; set; } = string.Empty;
        public string OrganizationNumber { get; set; } = string.Empty;
    }
}