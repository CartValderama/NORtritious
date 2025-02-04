using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Backend.DAL;
using Backend.DAL.Seed;
using Backend.Services;
using Microsoft.AspNetCore.Identity.UI.Services;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Add Endpoint Explorer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Add Controllers
builder.Services.AddControllers();

// Add Repository
builder.Services.AddScoped<IProductsRepository, ProductsRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// Add IdentityDbContext with SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
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

// Configure application cookie behavior to ensure a 401 on unauthorized api calls
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        // Handle unauthenticated requests
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        // Handle unauthorized requests (authenticated but insufficient permissions)
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }

        context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };

    // Cookie configuration for session security and expiration
    options.Cookie.HttpOnly = true;  // Prevent access via JavaScript
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;  // Use only over HTTPS
    options.Cookie.SameSite = SameSiteMode.Strict;  // Prevent CSRF attacks
    options.Cookie.Name = "YourAppAuthCookie";  // You can rename the cookie if needed
    options.ExpireTimeSpan = TimeSpan.FromDays(14);  // Cookie expiration (e.g., 14 days)
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
    await RoleSeeder.SeedRolesAsync(services);
    await UserSeeder.SeedAdminUserAsync(services);
    await UserSeeder.SeedProducerUserAsync(services);
    await UserSeeder.SeedResearcherUserAsync(services);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "api",
    pattern: "{controller}/{action=Index}/{id?}");

app.Run();
