using Moq;
using Xunit;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Backend.Controllers;
using Backend.DAL;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;
using Backend.DTO;
using System.Security.Claims;
using Microsoft.AspNetCore.Http; // Assuming Product is in the Models namespace

namespace ControllerTests
{
    public class ProductsControllerTests
    {
        private readonly Mock<IProductsRepository> _mockProductsRepository;
        private readonly Mock<ILogger<ProductsController>> _mockLogger;
        private readonly Mock<UserManager<IdentityUser>> _mockUserManager;
        private readonly ProductsController _controller;

        public ProductsControllerTests()
        {
            // Mock dependencies
            var userStoreMock = new Mock<IUserStore<IdentityUser>>();
#nullable disable
            _mockUserManager = new Mock<UserManager<IdentityUser>>(userStoreMock.Object, null, null, null, null, null, null, null, null);
#nullable restore
            _mockProductsRepository = new Mock<IProductsRepository>();
            _mockLogger = new Mock<ILogger<ProductsController>>();

            _controller = new ProductsController(_mockUserManager.Object, _mockProductsRepository.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAllProductsAsync_ReturnsOkResult_WhenProductsAreFound()
        {
            // Arrange: Mock a list of products
            var products = new List<Product>
        {
            new Product
            {
                ProductId = 1,
                Name = "Product 1",
                Group = "Group 1",
                Type = "Type 1",
                HasEfsaHealth = true,
                HasEfsaNutrition = true,
                HasNokkelhullet = false,
                ImageUrl = "",
                Calories = 100,
                Fat = 5,
                SatFat = 2,
                Carbs = 10,
                NatSugar = 5,
                AddedSugar = 2,
                Fiber = 3,
                Protein = 4,
                Salt = 1,
                UserId = "user123",
                CreatedByUser = new IdentityUser { UserName = "user123" } // Mock the CreatedByUser
            }
        };

            _mockProductsRepository.Setup(repo => repo.GetAllProductsAsync()).ReturnsAsync(products);

            // Act
            var result = await _controller.GetAllProductsAsync();

            // Assert: Check that the result is an OkObjectResult
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<Product>>(okResult.Value);
            Assert.Equal(products.Count, returnValue.Count);
        }

        [Fact]
        public async Task GetAllProductsAsync_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            // Arrange: Make the repository throw an exception
            _mockProductsRepository.Setup(repo => repo.GetAllProductsAsync()).ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetAllProductsAsync();

            // Assert: Check that the result is an Internal Server Error (500)
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Equal("Internal server error.", statusCodeResult.Value);
        }

        [Fact]
        public async Task GetProductByIdAsync_ReturnsOkResult_WhenProductIsFound()
        {
            // Arrange
            var productId = 1;
            var mockProduct = new Product { ProductId = productId, Name = "Product 1" };
            _mockProductsRepository.Setup(repo => repo.GetProductByIdAsync(productId))
                                    .ReturnsAsync(mockProduct);

            // Act
            var result = await _controller.GetProductByIdAsync(productId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result); // Verifies it returns OkResult
            var returnValue = Assert.IsType<Product>(okResult.Value); // Verifies that the returned value is of type Product
            Assert.Equal(productId, returnValue.ProductId); // Verifies the returned product has the correct ID
        }

        [Fact]
        public async Task GetProductByIdAsync_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            var productId = 1;
            _mockProductsRepository.Setup(repo => repo.GetProductByIdAsync(productId))
                                    .ReturnsAsync((Product)null); // Simulating no product found

            // Act
            var result = await _controller.GetProductByIdAsync(productId);

            // Assert
            Assert.IsType<NotFoundResult>(result); // Verifies it returns NotFound
        }

        [Fact]
        public async Task GetProductByIdAsync_ReturnsStatusCode500_WhenExceptionOccurs()
        {
            // Arrange
            var productId = 1;
            _mockProductsRepository.Setup(repo => repo.GetProductByIdAsync(productId))
                                    .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetProductByIdAsync(productId);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result); // Verifies it returns ObjectResult
            Assert.Equal(500, objectResult.StatusCode); // Verifies that the status code is 500
            Assert.Equal("Internal server error.", objectResult.Value); // Verifies the returned message
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsCreatedAtAction_WhenValidProduct()
        {
            // Arrange
            var productDTO = new ProductDTO
            {
                Name = "Product 1",
                Group = "Group A",
                Type = "Type 1",
                HasEfsaHealth = true,
                HasEfsaNutrition = true,
                HasNokkelhullet = false,
                ImageUrl = "https://example.com/product.jpg",
                Calories = 100,
                Fat = 10,
                SatFat = 5,
                Carbs = 20,
                NatSugar = 10,
                AddedSugar = 5,
                Fiber = 3,
                Protein = 10,
                Salt = 1
            };

            var userId = "user-id";
            var user = new IdentityUser { Id = userId };

            // Mock the user manager to return the user when called with userId
            _mockUserManager.Setup(um => um.FindByIdAsync(userId)).ReturnsAsync(user);

            // Mock the repository to return true when creating a product
            _mockProductsRepository.Setup(repo => repo.CreateProductAsync(It.IsAny<Product>())).ReturnsAsync(true);

            // Simulate that the User is already authenticated with the correct user ID
            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
            new Claim(ClaimTypes.NameIdentifier, userId)
            }));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDTO);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result);  // Check for CreatedAtAction
            Assert.Equal("GetProductByIdAsync", actionResult.ActionName);  // Check if the action is correct
            Assert.IsType<Product>(actionResult.Value);  // Verify that the result is of type Product
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsBadRequest_WhenProductDataIsNull()
        {
            // Act
            var result = await _controller.CreateProductAsync(null);

            // Assert
            var actionResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Product data is null.", actionResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsNotFound_WhenUserNotFound()
        {
            // Arrange
            var productDTO = new ProductDTO { Name = "Product 1" };
            var userId = "user-id";

            // Mock the user manager to return null for the user
            _mockUserManager.Setup(um => um.FindByIdAsync(userId)).ReturnsAsync((IdentityUser)null);

            // Simulate the User is authenticated
            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
            new Claim(ClaimTypes.NameIdentifier, userId)
            }));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDTO);

            // Assert
            var actionResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found.", actionResult.Value);
        }

        [Fact]
        public async Task CreateProductAsync_ReturnsStatusCode500_WhenExceptionOccurs()
        {
            // Arrange
            var productDTO = new ProductDTO { Name = "Product 1" };
            var userId = "user-id";

            // Mock the user manager to throw an exception
            _mockUserManager.Setup(um => um.FindByIdAsync(userId)).ThrowsAsync(new Exception("Test exception"));

            // Simulate the User is authenticated
            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
        new Claim(ClaimTypes.NameIdentifier, userId)
            }));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var result = await _controller.CreateProductAsync(productDTO);

            // Assert
            var actionResult = Assert.IsType<ObjectResult>(result);  // Check for ObjectResult instead of StatusCodeResult
            Assert.Equal(500, actionResult.StatusCode);  // Verify that the status code is 500
            Assert.Equal("Internal server error.", actionResult.Value);  // Verify that the error message matches
        }
    }
}