using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Backend.DAL;

public interface IAccountRepository
{
    Task<SignInResult> LoginAsync(string email, string password);
    Task LogoutAsync();
    Task<IdentityResult> RegisterAsync(Backend.Models.RegisterRequest request);
}