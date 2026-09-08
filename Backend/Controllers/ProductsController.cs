using System.Security.Claims;
using Backend.DAL;
using Backend.DTO;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductsController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IProductsRepository _productsRepository;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(UserManager<ApplicationUser> userManager, IProductsRepository productsRepository, ILogger<ProductsController> logger)
        {
            _userManager = userManager;
            _productsRepository = productsRepository;
            _logger = logger;
        }

        // GET: api/products
        // Not currently used in the frontend
        [HttpGet]
        [Authorize(Roles = "Admin, Producer, Researcher")]
        public async Task<IActionResult> GetAllProductsAsync()
        {
            try
            {
                var products = await _productsRepository.GetAllProductsAsync();
                return Ok(products);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] an error eccourred while executing GetAllProductsAsync.");
                return StatusCode(500, "Internal server error.");
            }
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Producer, Researcher")]
        public async Task<IActionResult> GetProductByIdAsync(int id)
        {
            try
            {
                var product = await _productsRepository.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound();
                }
                return Ok(product);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] and error occurred while executing GetProductByIdAsync.");
                return StatusCode(500, "Internal server error.");
            }
        }

        // GET: api/products (by user ID)
        [HttpGet("my-products")]
        [Authorize(Roles = "Producer, Researcher, Admin")]
        public async Task<IActionResult> GetProductByUserIdAsync()
        {
            try
            {
                // Get the user ID from the authenticated user
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Check if the user has the "Researcher" or "Admin" role
                if (User.IsInRole("Researcher") || User.IsInRole("Admin"))
                {
                    // Fetch all products for the researcher
                    var allProducts = await _productsRepository.GetAllProductsAsync();
                    if (allProducts == null || !allProducts.Any())
                    {
                        return NotFound("No products found.");
                    }
                    return Ok(allProducts);
                }
                // Call the repository to get products by user ID
                var products = await _productsRepository.GetProductsByUserIdAsync(userId);
                if (products == null || !products.Any())
                {
                    return NotFound("No products found for the current producer.");
                }
                return Ok(products);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] an error occurred while executing GetProductsByUserId.");
                return StatusCode(500, "Internal server error.");
            }
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

            // NOTE! Do we need this due to the existence of [Authorize] Attribute
            // which ensures a logged in user exists
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            try
            {
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
                    CategoryKey = productDTO.CategoryKey,
                    FoodType = productDTO.FoodType,
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
                    PortionSize = productDTO.PortionSize,
                    TotalStarch = productDTO.TotalStarch,
                    ResistantStarch = productDTO.ResistantStarch,
                    OtherSubstancesJson = productDTO.OtherSubstancesJson,
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
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] an error occurred while executing CreateProductAsync.");
                return StatusCode(500, "Internal server error.");
            }
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

            try
            {
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
                existingProduct.CategoryKey = productDTO.CategoryKey;
                existingProduct.FoodType = productDTO.FoodType;
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
                existingProduct.PortionSize = productDTO.PortionSize;
                existingProduct.TotalStarch = productDTO.TotalStarch;
                existingProduct.ResistantStarch = productDTO.ResistantStarch;
                existingProduct.OtherSubstancesJson = productDTO.OtherSubstancesJson;

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
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] an error occurred while executing UpdateProductAsync.");
                return StatusCode(500, "Internal server error.");
            }

        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Producer")]
        public async Task<IActionResult> DeleteProductAsync(int id)
        {
            try
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
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[ProductsController] an error occurred while executing DeleteProduct.");
                return StatusCode(500, "Internal server error.");
            }

            return NoContent();
        }

        // Handles image upload
        [HttpPost("upload-product-image")]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProductImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("[ProductsController] No file uploaded.");
                    return BadRequest(new { message = "No file uploaded." });
                }

                // Check if the file is an image
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(fileExtension))
                {
                    _logger.LogWarning("[ProductsController] Invalid file type: {FileName}", file.FileName);
                    return BadRequest(new { message = "Invalid file type. Allowed types: jpg, jpeg, png, gif." });
                }

                // Determine the upload folder for product images
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "product_images");

                // Ensure the folder exists
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generate a unique file name based on a timestamp and file extension
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save the file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var imageUrl = $"/images/product_images/{uniqueFileName}";

                _logger.LogInformation("[ProductsController] Product image uploaded successfully.");
                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ProductsController] Error uploading product image.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
            }
        }

        // Deletes a product's image if there was an error in submission
        [HttpDelete("delete-product-image")]
        [Authorize]
        public IActionResult DeleteProductImage([FromBody] ImageDeleteRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.ImageUrl))
                {
                    _logger.LogWarning("[ProductsController] No image URL provided.");
                    return BadRequest(new { message = "No image URL provided." });
                }

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", request.ImageUrl.TrimStart('/'));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    _logger.LogInformation("[ProductsController] Deleted orphaned image: {ImageUrl}", request.ImageUrl);
                    return Ok(new { message = "Image deleted successfully." });
                }

                _logger.LogWarning("[ProductsController] Image not found: {ImageUrl}", request.ImageUrl);
                return NotFound(new { message = "Image not found." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ProductsController] Error deleting product image.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
            }
        }
    }
}