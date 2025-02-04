using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.DAL;

public class ProductsRepository : IProductsRepository
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<ProductsRepository> _logger;

    public ProductsRepository(ApplicationDbContext db, ILogger<ProductsRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IEnumerable<Product>> GetAllProductsAsync()
    {
        var products = await _db.Products.ToListAsync();
        if (products == null) return new List<Product>();

        return products;
    }

    public async Task<Product?> GetProductByIdAsync(int productId)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
        return product;
    }

    public Task<IEnumerable<Product>> GetProductsByUserIdAsync(string userId)
    {
        throw new NotImplementedException();
    }

    // CreateProductAsync method to add a new product to the database
    public async Task<bool> CreateProductAsync(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        try
        {
            // Add the new product to the DbSet
            await _db.Products.AddAsync(product);

            // Save changes to the database
            var result = await _db.SaveChangesAsync();

            // Return true if the product was successfully saved
            return result > 0;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating product {product}", product);

            // Return false if there was an error saving the product
            return false;
        }
    }

    public Task<bool> UpdateProductAsync(Product product)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteProductAsync(int productId)
    {
        throw new NotImplementedException();
    }
}