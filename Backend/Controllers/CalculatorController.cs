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
        private readonly CalculatorReportService _reportService;
        private readonly ILogger<CalculatorController> _logger;

        public CalculatorController(
            CalculatorService calculatorService,
            CalculatorReportService reportService,
            ILogger<CalculatorController> logger)
        {
            _calculatorService = calculatorService;
            _reportService = reportService;
            _logger = logger;
        }

        // GET: api/calculator/schema?category=Kategori6&foodType=solid
        //
        // What the form needs before anything is entered: which inputs to show, which claims
        // will be assessed, and the thresholds to highlight against while typing. Anonymous
        // because it exposes no product data, only the rules, which are public regulation.
        [HttpGet("schema")]
        [AllowAnonymous]
        public IActionResult Schema([FromQuery] string category, [FromQuery] string foodType)
        {
            try
            {
                return Ok(_calculatorService.BuildSchema(category ?? string.Empty, foodType ?? string.Empty));
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[CalculatorController] Error in Schema for category {Category}", category);
                return StatusCode(500, "Internal server error.");
            }
        }

        // POST: api/calculator/report
        //
        // Takes the same inputs as /calculate plus the product's name and group, runs the
        // calculation itself and renders the result as a PDF. It recalculates rather than
        // accepting a finished result so the document can't state a verdict the calculator
        // wouldn't reach for the same inputs.
        [HttpPost("report")]
        [Authorize]
        public async Task<IActionResult> Report([FromBody] CalculatorReportRequestDTO request)
        {
            try
            {
                var pdf = await _reportService.BuildAsync(request);
                return File(pdf, "application/pdf");
            }
            catch (Exception e)
            {
                _logger.LogError(e, "[CalculatorController] Error in Report for category {Category}", request.Category);
                return StatusCode(500, "Internal server error.");
            }
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
