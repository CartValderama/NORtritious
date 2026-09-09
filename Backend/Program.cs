using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Backend.DAL;
using Backend.DAL.Seed;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity.UI.Services;
using Serilog;
using Serilog.Events;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add Endpoint Explorer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Bachelor API",
        Version = "v1"
    });
    c.EnableAnnotations();
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            var allowedOrigins = builder.Configuration["AllowedOrigins"]?.Split(',')
                ?? new[] { "http://localhost:5173" };
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()
                  .WithExposedHeaders("X-Total-Count", "X-Page", "X-Page-Size", "X-Has-More");
        });
});

// Add Controllers
builder.Services.AddControllers();

// Add Repository
builder.Services.AddScoped<IProductsRepository, ProductsRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// Add EU Health Claims register client (https://developer.datalake.sante.service.ec.europa.eu)
builder.Services.AddSingleton<ITranslationService, GoogleTranslateService>();
builder.Services.AddSingleton<IEuHealthClaimsService, EuHealthClaimsService>();

// Add Calculator
builder.Services.AddSingleton<CalculatorService>();

// Add Matvaretabellen client (https://www.matvaretabellen.no/api/)
builder.Services.AddSingleton<IMatvaretabellenService, MatvaretabellenService>();

// Add JWT token issuing service
builder.Services.AddScoped<ITokenService, TokenService>();

// Add IdentityDbContext with SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password Settings
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequiredUniqueChars = 6;

    // Lockout Settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(60);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User Settings
    options.User.RequireUniqueEmail = true;

    // Sign-In Settings
    options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// API auth uses a JWT bearer token instead of the Identity cookie. The frontend and
// backend live on different Railway subdomains (different registrable "sites" for
// cookie purposes), so a cross-site auth cookie gets silently dropped by browsers with
// third-party cookie blocking enabled (Safari ITP by default, Chrome/Edge when the user
// or an org policy has it on). A bearer token has no such browser-side cookie policy to
// fight, since the frontend attaches it itself on every request.
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]
    ?? throw new InvalidOperationException("Jwt:Key configuration is missing. Set it via appsettings or the Jwt__Key environment variable.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSection["Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(2),
    };
});

// Add EmailSender
builder.Services.AddSingleton<IEmailSender, DummyEmailSender>();

// Add Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireResearcherRole", policy => policy.RequireRole("Producer"));
    options.AddPolicy("RequireProducerRole", policy => policy.RequireRole("Customer"));
});

// Add Razor Pages
builder.Services.AddRazorPages();

// Add Logging
var loggerConfiguration = new LoggerConfiguration()
    .MinimumLevel.Information() // Trace < Information < Warning < Error < Fatal
    .WriteTo.File($"Logs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log");

loggerConfiguration.Filter.ByExcluding(e => e.Properties.TryGetValue("SourceContext", out var value) &&
    e.Level == LogEventLevel.Information &&
    e.MessageTemplate.Text.Contains("Executed DbCommand"));

var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var db = services.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
    await RoleSeeder.SeedRolesAsync(services);
    await UserSeeder.SeedAdminUserAsync(services);
    await UserSeeder.SeedProducerUserAsync(services);
    await UserSeeder.SeedResearcherUserAsync(services);
    await ProductSeeder.SeedProductsAsync(services);
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bachelor API V1");
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseStaticFiles();
app.UseRouting();
//app.UseCors("CorsPolicy");
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "api",
    pattern: "{controller}/{action=Index}/{id?}");

app.Run();
