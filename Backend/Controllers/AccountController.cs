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
    private readonly IApplicationRepository _applicationRepository;
    private readonly ILogger<AccountController> _logger;

    public AccountController(UserManager<IdentityUser> userManager, IApplicationRepository applicationRepository, ILogger<AccountController> logger)
    {
        _userManager = userManager;
        _applicationRepository = applicationRepository;
        _logger = logger;
    }

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
        return Unauthorized(new { message = "Invalid email or password" });
    }

    /*
    [HttpGet("authTest")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> AuthTest()
    {
        return null;
    }
    */
}