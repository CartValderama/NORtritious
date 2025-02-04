using System.Security.Claims;
using Backend.DAL;
using Backend.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[Route("api/products")]
[ApiController]
public class ProductsController : Controller
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IProductsRepository _productsRepository;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(UserManager<IdentityUser> userManager, IProductsRepository productsRepository, ILogger<ProductsController> logger)
    {
        _userManager = userManager;
        _productsRepository = productsRepository;
        _logger = logger;
    }

    // GET: api/products
    [HttpGet]
    [Authorize(Roles = "Admin, Producer, Researcher")]
    public async Task<IActionResult> GetAllProductsAsync()
    {
        var products = await _productsRepository.GetAllProductsAsync();
        return Ok(products);
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin, Producer, Researcher")]
    public async Task<IActionResult> GetProductByIdAsync(int id)
    {
        var product = await _productsRepository.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound();
        }
        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    [Authorize(Roles = "Producer")]
    public async Task<IActionResult> CreateProductAsync([FromBody] ProductDTO productDTO)
    {
        if (productDTO == null)
        {
            return BadRequest("Product data is null.");
        }

        // Get the user ID from the authenticated user (usually comes from the JWT token or other means)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User not authenticated.");
        }

        // Use UserManager to fetch the user object based on the userId
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Map the DTO to the Product entity
        var product = new Product
        {
            Name = productDTO.Name,
            Group = productDTO.Group,
            Type = productDTO.Type,
            HasEfsaHealth = productDTO.HasEfsaHealth,
            HasEfsaNutrition = productDTO.HasEfsaNutrition,
            HasNokkelhullet = productDTO.HasNokkelhullet,
            ImageUrl = productDTO.ImageUrl,
            Calories = productDTO.Calories,
            Fat = productDTO.Fat,
            SatFat = productDTO.SatFat,
            Carbs = productDTO.Carbs,
            NatSugar = productDTO.NatSugar,
            AddedSugar = productDTO.AddedSugar,
            Fiber = productDTO.Fiber,
            Protein = productDTO.Protein,
            Salt = productDTO.Salt,
            UserId = userId,  // Set the userId for the created product
            CreatedByUser = user  // Set the User navigation property
        };

        // Call your repository to create the product
        var success = await _productsRepository.CreateProductAsync(product);

        if (success)
        {
            return CreatedAtAction(nameof(GetProductByIdAsync), new { id = product.ProductId }, product);
        }

        return BadRequest("Failed to create product.");
    }

    // PUT: api/products/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin, Producer")]
    public async Task<IActionResult> UpdateProductAsync(int id, [FromBody] Product product)
    {
        if (product == null || product.ProductId != id)
        {
            return BadRequest();
        }

        var existingProduct = await _productsRepository.GetProductByIdAsync(id);
        if (existingProduct == null)
        {
            return NotFound();
        }

        // You can call the repository to update the product here
        var success = await _productsRepository.UpdateProductAsync(product);
        if (!success)
        {
            return StatusCode(500, "An error occurred while updating the product.");
        }

        return NoContent(); // Status 204 means the update was successful, but there's no content to return
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Producer")]
    public async Task<IActionResult> DeleteProductAsync(int id)
    {
        var success = await _productsRepository.DeleteProductAsync(id);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}