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

    public async Task<IEnumerable<Product>?> GetAllProductsAsync()
    {
        try 
        {
            var products = await _db.Products.ToListAsync();
            if (products == null) return new List<Product>();

            return products;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ProductRepository] Error getting all products");
            return null;
        }
        
    }

    public async Task<Product?> GetProductByIdAsync(int productId)
    {
        try
        {
            var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
            return product;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ProductRepository] Error getting product by Id {productId}", productId);
            return null;
        }
        
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

    // UpdateProductAsync method to update product to the database
    public async Task<bool> UpdateProductAsync(Product product)
    {
        if (product == null)
        {
            throw new ArgumentNullException(nameof(product));
        }

        try
        {
            _db.Products.Update(product);
            await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating product {product}", product);
            return false;
        }
        //throw new NotImplementedException();
    }

    // DeleteProductAsync method to delete a product from the database
    public async Task<bool> DeleteProductAsync(int productId)
    {
        try
        {
            var product = await _db.Products.FindAsync(productId);
            if (product == null)
            {
                _logger.LogError("[ProductRepository] Product not found for the ProductId {ProductId:0000}", productId);
                return false;
            }

            _db.Products.Remove(product);
            var result = await _db.SaveChangesAsync();
            return true;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "[ProductRepository] Error deleting product {productId}", productId);
            return false;
        }
        //throw new NotImplementedException();
    }
}