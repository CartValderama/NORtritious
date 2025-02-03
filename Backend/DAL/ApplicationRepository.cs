using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.DAL;

public class ApplicationRepository : IApplicationRepository
{
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<ApplicationRepository> _logger;

    public ApplicationRepository(SignInManager<IdentityUser> signInManager, ApplicationDbContext db, ILogger<ApplicationRepository> logger)
    {
        _signInManager = signInManager;
        _db = db;
        _logger = logger;
    }

    public async Task<SignInResult> LoginAsync(string email, string password)
    {
        var result = await _signInManager.PasswordSignInAsync(email, password, isPersistent: false, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            _logger.LogInformation("User {email} successfully signed in.", email);
        }
        else if (result.IsLockedOut)
        {
            _logger.LogWarning("User {email} account locked out.", email);
        }
        else if (result.RequiresTwoFactor)
        {
            _logger.LogWarning("User {email} requires two-factor authentication.", email);
        }
        else
        {
            _logger.LogWarning("Invalid login attempt for user {email}.", email);
        }

        return result;
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation("User logged out successfully.");
    }
}

