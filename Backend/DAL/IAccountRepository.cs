using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.DAL;

public interface IAccountRepository
{
    Task<SignInResult> LoginAsync(string email, string password);
    Task LogoutAsync();
}