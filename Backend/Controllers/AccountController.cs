using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Backend.DAL;
using Backend.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("api/account")]
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

        // Register method for Producers and Researchers, Takes email, password, and role, returns HTTP message OK on success, Bad Request otherwise
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] Backend.Models.RegisterRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _applicationRepository.RegisterAsync(request);

            if (result.Succeeded)
            {
                return Ok(new { message = "Registration successful" });
            }

            _logger.LogError("[AccountController] Registration failed when executing _applicationRepository.RegisterAsync()");
            return BadRequest(new { message = "Registration failed", errors = result.Errors });
        }


        // Login method for all users, Takes email and password, returns HTTP message OK on success, Unauthorized otherwise
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

        // Check if the user is logged in
        [HttpGet("check-login")]
        [AllowAnonymous]
        public IActionResult CheckLogin()
        {
            try
            {
                if (User.Identity?.IsAuthenticated == true)
                {
                    _logger.LogInformation("[AccountController] User {User} is authenticated.", User.Identity?.Name);
                    return Ok(new { isLoggedIn = true });
                }

                return Ok(new { isLoggedIn = false, message = "User is not authenticated." });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[AccountController] Error during check-login execution.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred!" });
            }
        }

        [HttpGet("get-user-info")]
        [Authorize]
        public async Task<IActionResult> GetUserInfo()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? string.Empty; // Bruker første rolle eller en tom string

                var response = new GetUserResponse
                {
                    Name = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Role = role
                };

                return Ok(response);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[AccountController] Error fetching user info.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred!" });
            }
        }

        [HttpGet("admin-role-test")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminRoleTest()
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

        // Lists all registered users in the logger for an admin to view
        [HttpGet("list-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ListUsersAsync()
        {
            try
            {
                _logger.LogInformation("[AccountController] User list accessed by Admin user {user}.", User.Identity?.Name);
                var users = await _applicationRepository.ListUsersAsync();
                return Ok(new { message = "Users listed in logger." });
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

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] Backend.Models.ChangePasswordRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found!" });
            }

            var result = await _applicationRepository.ChangePasswordAsync(request);

            if (result.Succeeded)
            {
                return Ok(new { message = "Password changed successfully!" });
            }

            return BadRequest(new { message = "Password change failed!", errors = result.Errors });
        }
    }
}