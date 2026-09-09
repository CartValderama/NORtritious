using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Backend.DTO;

namespace Backend.Services
{
    public interface IMatvaretabellenService
    {
        Task<(IReadOnlyList<MatvaretabellenFoodDetailDTO> Items, int TotalCount)> SearchAsync(
            string? query, int page, int pageSize, CancellationToken ct = default);
        Task<MatvaretabellenFoodDetailDTO?> GetByIdAsync(string foodId, CancellationToken ct = default);
    }

    // Fetches the Norwegian Food Safety Authority's bulk food-composition dataset
    // (https://www.matvaretabellen.no/api/) once and caches it in memory for the
    // life of the process. The dataset gets one annual update in the autumn and
    // "can be safely cached locally" per its own docs, so a ~14 MB refetch per
    // request would be pure waste.
    public class MatvaretabellenService : IMatvaretabellenService
    {
        private const string FoodsUrl = "https://www.matvaretabellen.no/api/nb/foods.json";

        // Matvaretabellen's own nutrientId values (see nutrients.json), mapped
        // onto the calculator's nutrition-table fields.
        private const string NutFat = "Fett";
        private const string NutSaturated = "Mettet";
        private const string NutTrans = "Trans";
        private const string NutCarbs = "Karbo";
        private const string NutSugars = "Mono+Di";
        private const string NutFibre = "Fiber";
        private const string NutProtein = "Protein";
        private const string NutSalt = "NaCl";
        private const string NutStarch = "Stivel";

        private readonly HttpClient _http;
        private readonly ILogger<MatvaretabellenService> _logger;
        private readonly SemaphoreSlim _loadLock = new(1, 1);
        private List<RawFood>? _foods;

        public MatvaretabellenService(ILogger<MatvaretabellenService> logger)
        {
            _http = new HttpClient();
            _http.DefaultRequestHeaders.UserAgent.ParseAdd("NORtritious-BachelorProject/1.0");
            _http.Timeout = TimeSpan.FromSeconds(30);
            _logger = logger;
        }

        private async Task EnsureLoadedAsync(CancellationToken ct)
        {
            if (_foods != null) return;
            await _loadLock.WaitAsync(ct);
            try
            {
                if (_foods != null) return;
                var root = await _http.GetFromJsonAsync<RawFoodsRoot>(FoodsUrl, ct);
                _foods = root?.Foods ?? new List<RawFood>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Matvaretabellen: failed to load bulk foods dataset");
                _foods ??= new List<RawFood>();
            }
            finally
            {
                _loadLock.Release();
            }
        }

        public async Task<(IReadOnlyList<MatvaretabellenFoodDetailDTO> Items, int TotalCount)> SearchAsync(
            string? query, int page, int pageSize, CancellationToken ct = default)
        {
            await EnsureLoadedAsync(ct);
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            IEnumerable<RawFood> filtered = _foods!;
            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim();
                filtered = filtered.Where(f =>
                    f.FoodName != null && f.FoodName.Contains(q, StringComparison.OrdinalIgnoreCase));
            }

            var ordered = filtered.OrderBy(f => f.FoodName, StringComparer.OrdinalIgnoreCase).ToList();
            var totalCount = ordered.Count;

            var pageItems = ordered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ToDetail)
                .ToList();

            return (pageItems, totalCount);
        }

        public async Task<MatvaretabellenFoodDetailDTO?> GetByIdAsync(string foodId, CancellationToken ct = default)
        {
            await EnsureLoadedAsync(ct);
            var food = _foods!.FirstOrDefault(f => f.FoodId == foodId);
            return food == null ? null : ToDetail(food);
        }

        private static MatvaretabellenFoodDetailDTO ToDetail(RawFood f)
        {
            var constituents = new Dictionary<string, double>();
            foreach (var c in f.Constituents ?? new List<RawConstituent>())
            {
                if (c.NutrientId != null) constituents[c.NutrientId] = c.Quantity ?? 0;
            }

            double Get(string id) => constituents.TryGetValue(id, out var v) ? v : 0;

            return new MatvaretabellenFoodDetailDTO
            {
                FoodId = f.FoodId ?? string.Empty,
                FoodName = f.FoodName ?? string.Empty,
                FoodGroupId = f.FoodGroupId ?? string.Empty,
                EnergyKcal = f.Calories?.Quantity ?? 0,
                EnergyKj = f.Energy?.Quantity ?? 0,
                Fat = Get(NutFat),
                SaturatedFat = Get(NutSaturated),
                TransFat = Get(NutTrans),
                Carbs = Get(NutCarbs),
                Sugars = Get(NutSugars),
                Fibre = Get(NutFibre),
                Protein = Get(NutProtein),
                Salt = Get(NutSalt),
                Starch = Get(NutStarch),
            };
        }

        // --- Raw shapes matching the Matvaretabellen bulk JSON payload ---

        private class RawFoodsRoot
        {
            [JsonPropertyName("foods")] public List<RawFood>? Foods { get; set; }
        }

        private class RawFood
        {
            [JsonPropertyName("foodId")] public string? FoodId { get; set; }
            [JsonPropertyName("foodName")] public string? FoodName { get; set; }
            [JsonPropertyName("foodGroupId")] public string? FoodGroupId { get; set; }
            [JsonPropertyName("calories")] public RawQuantity? Calories { get; set; }
            [JsonPropertyName("energy")] public RawQuantity? Energy { get; set; }
            [JsonPropertyName("constituents")] public List<RawConstituent>? Constituents { get; set; }
        }

        private class RawQuantity
        {
            [JsonPropertyName("quantity")] public double? Quantity { get; set; }
        }

        private class RawConstituent
        {
            [JsonPropertyName("nutrientId")] public string? NutrientId { get; set; }
            [JsonPropertyName("quantity")] public double? Quantity { get; set; }
        }
    }
}
