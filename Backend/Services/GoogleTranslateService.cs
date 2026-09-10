using System.Text;
using System.Text.Json;

namespace Backend.Services
{
    public interface ITranslationService
    {
        Task<string> TranslateToNorwegianAsync(string text, CancellationToken ct = default);
    }

    // Uses the free, unofficial Google Translate endpoint (translate.googleapis.com) — no
    // API key or account registration required. This is not an officially supported API:
    // it could be rate-limited or blocked without notice, so callers should treat failures
    // as non-fatal and fall back to the original (English) text.
    public class GoogleTranslateService : ITranslationService
    {
        private readonly HttpClient _http;
        private readonly ILogger<GoogleTranslateService> _logger;

        // Callers now translate in parallel (a register entry has five translatable fields, and
        // a calculation pulls a dozen entries at once), so without a ceiling one request could
        // open sixty connections to an endpoint that is neither official nor rate-limit
        // documented. Registered as a singleton, so this bounds the whole process, and a
        // throttled call waits rather than failing — the fallback would silently return English.
        private readonly SemaphoreSlim _throttle = new(8);

        public GoogleTranslateService(ILogger<GoogleTranslateService> logger)
        {
            _http = new HttpClient();
            _http.Timeout = TimeSpan.FromSeconds(10);
            _logger = logger;
        }

        public async Task<string> TranslateToNorwegianAsync(string text, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;

            await _throttle.WaitAsync(ct);
            try
            {
                var url = "https://translate.googleapis.com/translate_a/single" +
                    "?client=gtx&sl=en&tl=no&dt=t&q=" + Uri.EscapeDataString(text);

                using var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();

                using var stream = await response.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

                // Shape: [[[translated, original, ...], [translated, original, ...], ...], ...]
                var segments = doc.RootElement[0];
                var translated = new StringBuilder();
                foreach (var segment in segments.EnumerateArray())
                    translated.Append(segment[0].GetString());

                return translated.Length > 0 ? translated.ToString() : text;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "GoogleTranslate: failed to translate text, falling back to English");
                return text;
            }
            finally
            {
                _throttle.Release();
            }
        }
    }
}
