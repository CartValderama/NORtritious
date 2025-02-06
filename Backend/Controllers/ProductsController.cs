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

    // GET: api/products (by user ID)
    [HttpGet("my-products")]
    [Authorize(Roles = "Producer")]
    public async Task<IActionResult> GetProductByUserIdAsync()
    {
        // Get the user ID from the authenticated user
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Call the repository to get products by user ID
        var products = await _productsRepository.GetProductsByUserIdAsync(userId);
        if (products == null || !products.Any())
        {
            return NotFound("No products found for the current producer.");
        }
        return Ok(products);
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
    public async Task<IActionResult> UpdateProductAsync(int id, [FromBody] ProductDTO productDTO)
    {
        if (productDTO == null || productDTO.ProductId != id)
        {
            return BadRequest();
        }   
            
        // TODO: Producers should only update their own products, 
        // use GetProductsByUserIdAsync(userId)

        var existingProduct = await _productsRepository.GetProductByIdAsync(id);
        if (existingProduct == null)
        {
            return NotFound();
        }

        // Get the user ID from the authenticated user
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check if the user is a producer and if they are the owner of the product
        if (User.IsInRole("Producer") && existingProduct.UserId != userId)
        {
            return Unauthorized("Producers can only update their own products.");
        }

        existingProduct.Name = productDTO.Name;
        existingProduct.Group = productDTO.Group;
        existingProduct.Type = productDTO.Type;
        existingProduct.HasEfsaHealth = productDTO.HasEfsaHealth;
        existingProduct.HasEfsaNutrition = productDTO.HasEfsaNutrition;
        existingProduct.HasNokkelhullet = productDTO.HasNokkelhullet;
        existingProduct.ImageUrl = productDTO.ImageUrl;
        existingProduct.Calories = productDTO.Calories;
        existingProduct.Fat = productDTO.Fat;
        existingProduct.SatFat = productDTO.SatFat;
        existingProduct.Carbs = productDTO.Carbs;
        existingProduct.NatSugar = productDTO.NatSugar;
        existingProduct.AddedSugar = productDTO.AddedSugar;
        existingProduct.Fiber = productDTO.Fiber;
        existingProduct.Protein = productDTO.Protein;
        existingProduct.Salt = productDTO.Salt;

        // You can call the repository to update the product here
        var success = await _productsRepository.UpdateProductAsync(existingProduct);
        if (!success)
        {
            return StatusCode(500, "An error occurred while updating the product.");
        }
        else
        {
            return CreatedAtAction(nameof(GetProductByIdAsync), new { id = existingProduct.ProductId }, existingProduct);
        }

        //return NoContent(); // Status 204 means the update was successful, but there's no content to return
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin, Producer")]
    public async Task<IActionResult> DeleteProductAsync(int id)
    {

        var existingProduct = await _productsRepository.GetProductByIdAsync(id);
        if (existingProduct == null)
        {
            return NotFound();
        }

        // Get the user ID from the authenticated user
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
        // Check if the user is a producer and if they are the owner of the product
        if (User.IsInRole("Producer") && existingProduct.UserId != userId)
        {
            return Unauthorized("Producers can only delete their own products.");
        }

        var success = await _productsRepository.DeleteProductAsync(id);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}