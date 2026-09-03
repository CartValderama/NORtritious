using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Backend.DAL;

public interface IAccountRepository
{
    Task<Backend.Models.LoginResult> LoginAsync(string email, string password);
    Task LogoutAsync();
    Task<IdentityResult> RegisterAsync(Backend.Models.RegisterRequest request);
    Task<IdentityResult> ListUsersAsync();
    Task<IdentityResult> ChangePasswordAsync(Models.ChangePasswordRequest request);//Backend.Models.ChangePasswordRequest request);
}