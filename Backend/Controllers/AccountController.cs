using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAccountRepository _applicationRepository;
        private readonly ILogger<AccountController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

        public AccountController(UserManager<ApplicationUser> userManager, IAccountRepository applicationRepository, ILogger<AccountController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _applicationRepository = applicationRepository;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
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

            if (result.SignIn.Succeeded)
            {
                return Ok(new { message = "Login successful", token = result.Token });
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
                    Name = user.Name ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Role = role,
                    OrganizationNumber = user.OrganizationNumber ?? string.Empty,
                    ProfilePicture = user.ProfilePicture ?? string.Empty
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

        [HttpPut("update-user-info")]
        [Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] Backend.Models.UpdateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("[AccountController] UpdateUser request failed validation. ModelState: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            // Hent den autentiserte brukeren
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("[AccountController] UpdateUser attempt failed - User not found. User: {User}", User.Identity?.Name);
                return Unauthorized(new { message = "User not found" });
            }

            // Logg før oppdatering
            _logger.LogInformation("[AccountController] Updating user {User}. Current Name: {OldName}, Current OrganizationNumber: {OldOrgNum}",
                User.Identity?.Name, user.Name, user.OrganizationNumber);

            // Oppdater de nødvendige feltene (uten å endre e-posten)
            user.Name = request.Name ?? user.Name;
            user.OrganizationNumber = request.OrganizationNumber ?? user.OrganizationNumber;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                _logger.LogInformation("[AccountController] User {User} updated successfully. New Name: {NewName}, New OrganizationNumber: {NewOrgNum}",
                    User.Identity?.Name, user.Name, user.OrganizationNumber);
                return Ok(new { message = "User updated successfully!" });
            }

            // Hvis oppdateringen mislykkes
            _logger.LogError("[AccountController] User update failed for {User}. Errors: {@Errors}",
                User.Identity?.Name, result.Errors);

            return BadRequest(new { message = "User update failed", errors = result.Errors });
        }

        [HttpPost("upload-profile-picture")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("[AccountController] No file uploaded.");
                    return BadRequest(new { message = "No file uploaded." });
                }

                // Sjekk om filen er et bilde
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    _logger.LogWarning("[AccountController] Invalid file type: {FileName}", file.FileName);
                    return BadRequest(new { message = "Invalid file type. Allowed types: jpg, jpeg, png, gif." });
                }

                // Finn brukeren
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    _logger.LogWarning("[AccountController] User not found.");
                    return Unauthorized(new { message = "User not found." });
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "profile_pictures");

                // Slett gammelt bilde hvis det finnes
                if (!string.IsNullOrEmpty(user.ProfilePicture))
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfilePicture.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldFilePath);
                            _logger.LogInformation("[AccountController] Old profile picture deleted: {FilePath}", oldFilePath);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "[AccountController] Failed to delete old profile picture: {FilePath}", oldFilePath);
                        }
                    }
                }

                // Lag et unikt filnavn (bruker UserId + timestamp)
                var uniqueFileName = $"{user.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Lagre filen
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Oppdater brukerens bilde-URL i databasen
                user.ProfilePicture = $"/images/profile_pictures/{uniqueFileName}";
                var updateResult = await _userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    _logger.LogError("[AccountController] Failed to update user profile picture for {User}. Errors: {@Errors}",
                        user.UserName, updateResult.Errors);
                    return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to update user profile picture." });
                }

                _logger.LogInformation("[AccountController] Profile picture uploaded successfully for user {User}.", user.UserName);
                return Ok(new { message = "Profile picture uploaded successfully!", profilePictureUrl = user.ProfilePicture });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AccountController] Error uploading profile picture.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
            }
        }
    }
}