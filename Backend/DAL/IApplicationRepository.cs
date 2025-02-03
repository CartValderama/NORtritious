using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.DAL;

public interface IApplicationRepository
{
    Task<SignInResult> LoginAsync(string email, string password);
    Task LogoutAsync();
}