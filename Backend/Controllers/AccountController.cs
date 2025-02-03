using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Backend.DAL;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
[ApiController]
public class AccountController : Controller
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IAccountRepository _applicationRepository;
    private readonly ILogger<AccountController> _logger;

    public AccountController(UserManager<IdentityUser> userManager, IAccountRepository applicationRepository, ILogger<AccountController> logger)
    {
        _userManager = userManager;
        _applicationRepository = applicationRepository;
        _logger = logger;
    }

    /// <summary>
    ///     Example method for logging in.
    /// </summary>
    /// <param name="request">Takes email and password</param>
    /// <returns>HTTP message OK on success, Unauthorized otherwise</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _applicationRepository.LoginAsync(request.Email, request.Password);

        if (result.Succeeded)
        {
            return Ok(new { message = "Login successful" });
        }

        _logger.LogError("[AccountController] Login failed when executing _applicationRepository.LoginAsync()");
        return Unauthorized(new { message = "Invalid email or password!" });
    }


    [HttpGet("authTest")]
    [Authorize(Policy = "RequireAdminRole")]
    public IActionResult AuthTest()
    {
        try
        {
            _logger.LogInformation("[AccountController] Auth test accessed by Admin user {user}.", User.Identity?.Name);
            return Ok(new { message = "Access granted: You are an Admin!" });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[AccountController] Error during authTest execution.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred!" });
        }

    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await _applicationRepository.LogoutAsync();
            _logger.LogInformation("[AccountController] User {User} logged out successfully.", User.Identity?.Name);
            return Ok(new { message = "Logout successful!" });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[AccountController] Error during logout.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred!" });
        }

    }

}