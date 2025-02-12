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
using Backend.Models; // Assuming Product is in the Models namespace

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
    }
}