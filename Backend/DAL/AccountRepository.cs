using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Backend.DAL;

public class AccountRepository : IAccountRepository
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AccountRepository> _logger;

    public AccountRepository(SignInManager<ApplicationUser> signInManager, UserManager<ApplicationUser> userManager, ITokenService tokenService, ApplicationDbContext db, ILogger<AccountRepository> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _db = db;
        _logger = logger;
    }

    // Validates credentials and issues a JWT on success. Uses CheckPasswordSignInAsync
    // (not PasswordSignInAsync) so no auth cookie is set — the frontend and backend live
    // on different Railway subdomains, so a cross-site cookie gets silently dropped by
    // browsers with third-party cookie blocking enabled. A bearer token sidesteps that.
    public async Task<Backend.Models.LoginResult> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            _logger.LogWarning("Invalid login attempt for user {email}.", email);
            return new Backend.Models.LoginResult(SignInResult.Failed, null);
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

        if (result.Succeeded)
        {
            _logger.LogInformation("User {email} successfully signed in.", email);
            var token = await _tokenService.GenerateTokenAsync(user);
            return new Backend.Models.LoginResult(result, token);
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

        return new Backend.Models.LoginResult(result, null);
    }

    public async Task LogoutAsync()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation("User logged out successfully.");
    }

    // Registers a new user by creating a new IdentityUser object and adding it to the database with the specified role
    public async Task<IdentityResult> RegisterAsync(RegisterRequest request)
    {
        var user = new ApplicationUser { UserName = request.Email, Email = request.Email, Name = request.Name, OrganizationNumber = request.OrganizationNumber };
        var result = await _userManager.CreateAsync(user, request.Password);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, request.Role);
            _logger.LogInformation("User {user} successfully registered.", user);

            var resultLogin = await _signInManager.PasswordSignInAsync(request.Email, request.Password, isPersistent: false, lockoutOnFailure: true);
            if (resultLogin.Succeeded)
            {
                _logger.LogInformation("User {email} successfully signed in.", request.Email);
            }
            else
            {
                _logger.LogWarning("Invalid login attempt for user {email}.", request.Email);
            }
        }
        else
        {
            _logger.LogError("Error registering user {user}.", user);
        }
        return result;
    }

    // Lists all registered users in the database and logs them for an admin
    public async Task<IdentityResult> ListUsersAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        foreach (var user in users)
        {
            _logger.LogInformation("User {user} found.", user);
        }
        return IdentityResult.Success;
    }

    // Changes the password of a user with the specified email
    public async Task<IdentityResult> ChangePasswordAsync(ChangePasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("User {user} not found.", user);
            return IdentityResult.Failed();
        }

        var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
        if (result.Succeeded)
        {
            _logger.LogInformation("Password changed for user {user}.", user);
        }
        else
        {
            _logger.LogWarning("Error changing password for user {email}.", user);
        }
        return result;
    }

}

