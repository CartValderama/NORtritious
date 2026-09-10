using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Backend.Services
{
    // A single row from the EU Commission's official Health Claims register
    // (https://developer.datalake.sante.service.ec.europa.eu — "health-claims-list-details").
    public class EuHealthClaimEntry
    {
        public long PolicyItemId { get; set; }
        public string PolicyItemCode { get; set; } = string.Empty;
        public string NutrientSubstFood { get; set; } = string.Empty;
        public string ClaimType { get; set; } = string.Empty;
        public string ClaimStatus { get; set; } = string.Empty;
        public string Claim { get; set; } = string.Empty;

        // The register's own English claim wording, before translation. Kept so a claim whose
        // Norwegian rendering turns out to be wrong can fall back to the authorised source
        // text instead of to invented wording.
        public string ClaimOriginal { get; set; } = string.Empty;
        public string ConditionOfUse { get; set; } = string.Empty;
        public string HealthRelation { get; set; } = string.Empty;
        public string RestrictionsOfUse { get; set; } = string.Empty;
        public string LegislationUrl { get; set; } = string.Empty;
        public string LegislationType { get; set; } = string.Empty;
        public string LegislationReference { get; set; } = string.Empty;
        public string EfsaQuestion { get; set; } = string.Empty;
        public string EfsaQuestionUrl { get; set; } = string.Empty;
    }

    public interface IEuHealthClaimsService
    {
        Task<EuHealthClaimEntry?> GetByIdAsync(long policyItemId, CancellationToken ct = default);

        // Warms the cache for several entries at once. A caller that knows up front which
        // claims it needs calls this before walking its lists, and its existing GetByIdAsync
        // calls then complete from memory instead of one round trip at a time. Purely an
        // optimisation: an id left out still resolves, it just pays for its own fetch.
        Task PrefetchAsync(IEnumerable<long> policyItemIds, CancellationToken ct = default);
    }

    // Fetches individual entries from the EU Health Claims register on demand
    // (health-claims-list-details, filtered by policy_item_id) and caches them
    // in memory for the lifetime of the process — the register changes rarely
    // enough that a per-request refresh isn't warranted.
    public class EuHealthClaimsService : IEuHealthClaimsService
    {
        private const string BaseUrl =
            "https://api.datalake.sante.service.ec.europa.eu/health-claims/health-claims-list-details";

        private readonly HttpClient _http;
        private readonly ILogger<EuHealthClaimsService> _logger;
        private readonly ITranslationService _translator;
        private readonly ConcurrentDictionary<long, EuHealthClaimEntry?> _cache = new();

        public EuHealthClaimsService(ILogger<EuHealthClaimsService> logger, ITranslationService translator)
        {
            _http = new HttpClient();
            _http.DefaultRequestHeaders.UserAgent.ParseAdd("NORtritious-BachelorProject/1.0");
            _http.Timeout = TimeSpan.FromSeconds(20);
            _logger = logger;
            _translator = translator;
        }

        public Task PrefetchAsync(IEnumerable<long> policyItemIds, CancellationToken ct = default) =>
            Task.WhenAll(policyItemIds
                .Distinct()
                .Where(id => !_cache.ContainsKey(id))
                .Select(id => GetByIdAsync(id, ct)));

        public async Task<EuHealthClaimEntry?> GetByIdAsync(long policyItemId, CancellationToken ct = default)
        {
            if (_cache.TryGetValue(policyItemId, out var cached))
                return cached;

            EuHealthClaimEntry? entry = null;

            // A null caches only when the register itself answered and had no such row. A
            // request that threw is left uncached so the next caller retries: caching it would
            // let one timeout blank that claim for the rest of the process's life.
            bool answered = false;
            try
            {
                var url = $"{BaseUrl}?policy_item_id={policyItemId}&format=json&api-version=v2.0";
                using var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();

                var stream = await response.Content.ReadAsStreamAsync(ct);
                var payload = await JsonSerializer.DeserializeAsync<ApiResponse>(stream,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, ct);

                answered = true;

                var raw = payload?.Value?.FirstOrDefault();
                if (raw != null)
                {
                    string claim = StripHtml(raw.Claim);
                    string conditionOfUse = StripHtml(raw.ConditionOfUse);
                    string healthRelation = StripHtml(raw.HealthRelation);
                    string restrictionsOfUse = StripHtml(raw.RestrictionsOfUse);
                    string legislationReference = raw.LegislationReference ?? string.Empty;

                    // Five independent translations of five separate fields. Awaiting them one
                    // after another made a single entry cost five round trips in sequence, and
                    // a calculation fetches a dozen entries.
                    var claimNo = _translator.TranslateToNorwegianAsync(claim, ct);
                    var conditionNo = _translator.TranslateToNorwegianAsync(conditionOfUse, ct);
                    var relationNo = _translator.TranslateToNorwegianAsync(healthRelation, ct);
                    var restrictionsNo = _translator.TranslateToNorwegianAsync(restrictionsOfUse, ct);
                    var legislationNo = _translator.TranslateToNorwegianAsync(legislationReference, ct);
                    await Task.WhenAll(claimNo, conditionNo, relationNo, restrictionsNo, legislationNo);

                    entry = new EuHealthClaimEntry
                    {
                        PolicyItemId = policyItemId,
                        PolicyItemCode = raw.PolicyItemCode ?? string.Empty,
                        NutrientSubstFood = StripHtml(raw.NutrientSubstFoodNoHtml ?? raw.NutrientSubstFood),
                        ClaimType = raw.ClaimType ?? string.Empty,
                        ClaimStatus = raw.ClaimStatus ?? string.Empty,
                        Claim = await claimNo,
                        ClaimOriginal = claim,
                        ConditionOfUse = await conditionNo,
                        HealthRelation = await relationNo,
                        RestrictionsOfUse = await restrictionsNo,
                        LegislationUrl = raw.LegislationUrl ?? string.Empty,
                        LegislationType = raw.LegislationType ?? string.Empty,
                        LegislationReference = await legislationNo,
                        EfsaQuestion = raw.EfsaQuestion ?? string.Empty,
                        EfsaQuestionUrl = raw.EfsaQuestionUrl ?? string.Empty,
                    };
                }
                else
                {
                    _logger.LogWarning("EuHealthClaims: no entry found for policy_item_id {Id}", policyItemId);
                }
            }
            catch (Exception ex)
            {
                answered = false;
                _logger.LogError(ex, "EuHealthClaims: failed to fetch policy_item_id {Id}", policyItemId);
            }

            if (answered) _cache[policyItemId] = entry;
            return entry;
        }

        private static string StripHtml(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
            var plain = Regex.Replace(raw, "<[^>]+>", " ");
            return Regex.Replace(plain, @"\s{2,}", " ").Trim();
        }

        private class ApiResponse
        {
            public List<ApiEntry>? Value { get; set; }
        }

        private class ApiEntry
        {
            [JsonPropertyName("policy_item_code")] public string? PolicyItemCode { get; set; }
            [JsonPropertyName("nutrient_subst_food")] public string? NutrientSubstFood { get; set; }
            [JsonPropertyName("nutrient_subst_food_no_html")] public string? NutrientSubstFoodNoHtml { get; set; }
            [JsonPropertyName("claim_type")] public string? ClaimType { get; set; }
            [JsonPropertyName("claim_status")] public string? ClaimStatus { get; set; }
            [JsonPropertyName("claim")] public string? Claim { get; set; }
            [JsonPropertyName("condition_of_use")] public string? ConditionOfUse { get; set; }
            [JsonPropertyName("health_relation")] public string? HealthRelation { get; set; }
            [JsonPropertyName("restrictions_of_use")] public string? RestrictionsOfUse { get; set; }
            [JsonPropertyName("legislation_url")] public string? LegislationUrl { get; set; }
            [JsonPropertyName("legislation_type")] public string? LegislationType { get; set; }
            [JsonPropertyName("legislation_reference")] public string? LegislationReference { get; set; }
            [JsonPropertyName("efsa_question")] public string? EfsaQuestion { get; set; }
            [JsonPropertyName("efsa_question_url")] public string? EfsaQuestionUrl { get; set; }
        }
    }
}
