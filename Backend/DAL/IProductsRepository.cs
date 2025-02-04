
namespace Backend.DAL;

public interface IProductsRepository
{
    Task<IEnumerable<Product>> GetAllProductsAsync();
    Task<IEnumerable<Product>> GetProductsByUserIdAsync(string userId);
    Task<Product?> GetProductByIdAsync(int productId);
    Task<bool> CreateProductAsync(Product product);
    Task<bool> UpdateProductAsync(Product product);
    Task<bool> DeleteProductAsync(int productId);
}