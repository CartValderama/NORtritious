using Backend.DTO;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/calculator")]
    [ApiController]
    public class CalculatorController : ControllerBase
    {
        private readonly CalculatorService _calculatorService;
        private readonly ILogger<CalculatorController> _logger;

        public CalculatorController(CalculatorService calculatorService, ILogger<CalculatorController> logger)
        {
            _calculatorService = calculatorService;
            _logger = logger;
        }

        // POST: api/calculator/calculate
        [HttpPost("calculate")]
        [Authorize]
        public async Task<IActionResult> Calculate([FromBody] CalculatorRequestDTO request)
        {
            try
            {
                var result = await _calculatorService.Calculate(request);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[CalculatorController] Error in Calculate for category {Category}", request.Category);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
