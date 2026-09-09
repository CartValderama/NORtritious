using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/matvaretabellen")]
    [ApiController]
    [Authorize]
    public class MatvaretabellenController : ControllerBase
    {
        private readonly IMatvaretabellenService _matvaretabellenService;
        private readonly ILogger<MatvaretabellenController> _logger;

        public MatvaretabellenController(
            IMatvaretabellenService matvaretabellenService,
            ILogger<MatvaretabellenController> logger)
        {
            _matvaretabellenService = matvaretabellenService;
            _logger = logger;
        }

        // GET: api/matvaretabellen/foods?query=&page=1&pageSize=6
        // Returns one batch of matches (full nutrient breakdown per item, not just
        // energy). The dataset has 2000+ entries, so pagination info travels in
        // response headers instead of the body — the frontend only asks for the
        // next batch when the user clicks "Vis flere".
        [HttpGet("foods")]
        public async Task<IActionResult> SearchFoods(
            [FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 6)
        {
            try
            {
                var (items, totalCount) = await _matvaretabellenService.SearchAsync(query, page, pageSize);
                var hasMore = page * pageSize < totalCount;

                Response.Headers["X-Total-Count"] = totalCount.ToString();
                Response.Headers["X-Page"] = page.ToString();
                Response.Headers["X-Page-Size"] = pageSize.ToString();
                Response.Headers["X-Has-More"] = hasMore ? "true" : "false";

                return Ok(items);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[MatvaretabellenController] Error searching foods for query {Query}", query);
                return StatusCode(500, "Internal server error.");
            }
        }

        // GET: api/matvaretabellen/foods/{foodId}
        [HttpGet("foods/{foodId}")]
        public async Task<IActionResult> GetFood(string foodId)
        {
            try
            {
                var food = await _matvaretabellenService.GetByIdAsync(foodId);
                if (food == null) return NotFound();
                return Ok(food);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[MatvaretabellenController] Error fetching food {FoodId}", foodId);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
