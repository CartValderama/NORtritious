using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public record LoginResult(SignInResult SignIn, string? Token);
