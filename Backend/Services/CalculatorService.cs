using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.DTO;

namespace Backend.Services
{
    public class CalculatorService
    {
        private readonly List<HealthClaimEntry> _healthClaims;
        private readonly IEuHealthClaimsService _euHealthClaims;

        // Minimum amounts (in g) required per "other" nutrient for the claim to be valid
        private static readonly Dictionary<string, decimal> OtherMinimumsG = new()
        {
            ["Activated Charcoal"] = 1m,
            ["Alpha-cyclodextrin"] = 5m,
            ["Arabinoxylan produced from wheat endosperm"] = 8m,
            ["Beta-glucans"] = 1m,
            ["Barley beta-glucans"] = 1m,
            ["Beta-glucans from oats and barley"] = 4m,
            ["Betaine"] = 0.5m,
            ["Folic Acid"] = 0.0004m,
            ["Guar Gum"] = 10m,
            ["Lactitol"] = 10m,
            ["Lactulose"] = 10m,
            ["Native chicory inulin"] = 12m,
            ["Oat beta-glucan"] = 1m,
            ["Olive oil polyphenols"] = 0.005m,
            ["Plant stanol esters"] = 1.5m,
            ["Plant sterols and plant stanols"] = 0.8m,
            ["Walnuts"] = 30m,
            ["Essential Fatty Acids (ALA & LA)"] = 2m,
            ["Alpha-linolenic acid (ALA)"] = 2m,
        };

        // How a given "Other" substance claim's condition can actually be checked from the
        // data this calculator collects.
        private enum OtherClaimCheck
        {
            // amount (g per 100g) >= a fixed minimum, e.g. "at least 1g per quantified portion"
            GramThreshold,
            // the substance's own amount must itself pass the HIGH FIBRE threshold
            // (>=6g/100g or >=3g/100kcal) — condition text: "food which is high in that fibre"
            HighFibreSource,
            // beta-glucan grams in the portion >= 4/30 of the carbs grams in the portion
            // (">=4g beta-glucan per 30g available carbohydrates in a quantified portion") —
            // uses the product's own portion size.
            BetaGlucanMealRatio,
            // condition can't be derived from any field this calculator collects
            NotComputable,
        }

        private record OtherClaimRule(long PolicyItemId, OtherClaimCheck Check, decimal? MinGrams = null);

        // Maps a selectable "Other" substance name to every EU-register claim that applies to it.
        // A substance can have more than one authorised claim (e.g. Beta-glucans has both a
        // cholesterol claim and a separate post-meal-glucose claim) — all are shown.
        private static readonly Dictionary<string, OtherClaimRule[]> OtherClaimRegistry = new()
        {
            ["Beta-glucans"] = new[]
            {
                new OtherClaimRule(760097, OtherClaimCheck.GramThreshold, 1m),
                new OtherClaimRule(760137, OtherClaimCheck.BetaGlucanMealRatio),
            },
            ["Barley beta-glucans"] = new[] { new OtherClaimRule(756273, OtherClaimCheck.GramThreshold, 1m) },
            ["Oat beta-glucan"]     = new[] { new OtherClaimRule(757081, OtherClaimCheck.GramThreshold, 1m) },
            ["Barley grain fibre"]  = new[] { new OtherClaimRule(760061, OtherClaimCheck.HighFibreSource) },
            ["Rye fibre"]           = new[] { new OtherClaimRule(764917, OtherClaimCheck.HighFibreSource) },
            ["Wheat bran fibre"]    = new[]
            {
                new OtherClaimRule(767477, OtherClaimCheck.HighFibreSource),
                new OtherClaimRule(767513, OtherClaimCheck.HighFibreSource),
            },
            ["Oat grain fibre"]     = new[] { new OtherClaimRule(763813, OtherClaimCheck.HighFibreSource) },
        };

        // Resistant starch (764557) isn't a user-selectable "Other" substance like the ones above —
        // its condition needs two dedicated nutrition fields (TotalStarch/ResistantStarch), so it's
        // checked directly from NutritionInputDTO instead, alongside the Karbohydrater claims.
        private const long ResistantStarchClaimId = 764557;

        // Nøkkelhullet thresholds per category (all values per 100 g/ml)
        // null = no requirement for that nutrient in this category
        private record CategoryThreshold(
            decimal? MaxFat = null,
            decimal? MaxSatFat = null,
            decimal? DynamicSatFatFraction = null,
            decimal? MaxTotalSugars = null,  // sukkerarter = NaturalSugars + AddedSugars
            decimal? MaxAddedSugars = null,
            decimal? MinFibre = null,
            decimal? MaxSalt = null
        );

        // Categories with no numeric thresholds — always pass if inputs are provided
        private static readonly HashSet<string> AlwaysPassCategories = new() { "Kategori0", "Kategori2", "Kategori21" };

        private static readonly Dictionary<string, CategoryThreshold> NokkelhulletThresholds = new()
        {
            // Cat 1–10
            // Kategori1: tilsatt fett <= 3; satFat <= 20% of tilsatt fett (dynamic); tilsatte sukkerarter <= 1; salt <= 0.5
            ["Kategori1"]   = new(MaxFat: 3m,    DynamicSatFatFraction: 0.2m,  MaxAddedSugars: 1m,  MaxSalt: 0.5m),
            ["Kategori3"]   = new(MaxSatFat: 10m),
            ["Kategori4"]   = new(MinFibre: 6m),
            ["Kategori5"]   = new(MinFibre: 3m),
            ["Kategori6"]   = new(MaxFat: 8m,    MaxTotalSugars: 13m,    MaxAddedSugars: 9m,   MinFibre: 6m,  MaxSalt: 1m),
            ["Kategori7"]   = new(MaxFat: 4m,    MaxTotalSugars: 5m,     MinFibre: 1m,         MaxSalt: 0.3m),
            ["Kategori8a"]  = new(MaxFat: 7m,    MaxTotalSugars: 5m,     MinFibre: 5m,         MaxSalt: 1m),
            ["Kategori8b"]  = new(MaxFat: 7m,    MaxTotalSugars: 5m,     MinFibre: 6m,         MaxSalt: 1.2m),
            ["Kategori9"]   = new(MaxFat: 7m,    MaxTotalSugars: 5m,     MinFibre: 6m,         MaxSalt: 1.3m),
            ["Kategori10"]  = new(MinFibre: 6m,  MaxSalt: 0.1m),

            // Milk (cat 11–15)
            ["Melk11a"]     = new(MaxFat: 0.7m),
            ["Melk11b"]     = new(MaxFat: 1.5m,  DynamicSatFatFraction: 0.33m, MaxTotalSugars: 5m,        MaxSalt: 0.1m),
            ["Melk12a"]     = new(MaxFat: 1.5m),
            ["Melk12b"]     = new(MaxFat: 1.5m,  DynamicSatFatFraction: 0.33m, MaxTotalSugars: 5m,        MaxSalt: 0.1m),
            ["Melk13a"]     = new(MaxFat: 1.5m,  MaxAddedSugars: 4m),
            ["Melk13b"]     = new(MaxFat: 1.5m,  DynamicSatFatFraction: 0.33m, MaxTotalSugars: 8m,        MaxSalt: 0.1m),
            ["Melk14a"]     = new(MaxFat: 5m),
            ["Melk14b"]     = new(MaxFat: 5m,    DynamicSatFatFraction: 0.33m, MaxTotalSugars: 5m,        MaxSalt: 0.3m),
            ["Melk15a"]     = new(MaxFat: 5m,    MaxTotalSugars: 5m,     MaxSalt: 0.8m),
            ["Melk15b"]     = new(MaxFat: 5m,    DynamicSatFatFraction: 0.33m, MaxTotalSugars: 5m,        MaxSalt: 0.8m),

            // Cat 16–23 (cheese, fats, fish, meat)
            ["Kategori16"]  = new(MaxFat: 17m,   MaxSalt: 1.6m),
            ["Kategori17"]  = new(MaxFat: 17m,   DynamicSatFatFraction: 0.2m,  MaxSalt: 1.5m),
            ["Kategori18"]  = new(MaxFat: 5m,    MaxAddedSugars: 1m,           MaxSalt: 0.9m),
            ["Kategori19"]  = new(MaxFat: 80m,   DynamicSatFatFraction: 0.33m),
            ["Kategori20"]  = new(DynamicSatFatFraction: 0.2m,                 MaxSalt: 1m),
            // Kategori21 has no numeric thresholds — handled separately (AlwaysPassCategories)
            ["Kategori22a"] = new(MaxFat: 10m,   MaxTotalSugars: 5m,     MaxSalt: 1.5m),
            ["Kategori22b"] = new(MaxFat: 10m,   MaxTotalSugars: 5m,     MaxSalt: 2.5m),
            ["Kategori22c"] = new(MaxFat: 10m,   MaxTotalSugars: 5m,     MaxSalt: 3m),
            ["Kategori22d"] = new(MaxFat: 10m,   MaxTotalSugars: 5m,     MaxSalt: 3m),
            ["Kategori23"]  = new(MaxFat: 10m),

            // Cat 24 (meat products)
            ["Kategori24a1"]= new(MaxFat: 10m,   MaxTotalSugars: 3m,     MaxSalt: 1.0m),
            ["Kategori24a2"]= new(MaxFat: 10m,   MaxTotalSugars: 3m,     MaxSalt: 0.5m),
            ["Kategori24b1"]= new(MaxFat: 10m,   MaxAddedSugars: 3m, MaxSalt: 1.7m),
            ["Kategori24b2"]= new(MaxFat: 10m,   MaxAddedSugars: 3m, MaxSalt: 2.0m),
            ["Kategori24b3"]= new(MaxFat: 10m,   MaxAddedSugars: 3m, MaxSalt: 2.2m),
            ["Kategori24b4"]= new(MaxFat: 10m,   MaxTotalSugars: 3m,     MaxAddedSugars: 3m,   MaxSalt: 1.0m),
            ["Kategori24c1"]= new(MaxFat: 10m,   MaxAddedSugars: 3m, MaxSalt: 2.0m),
            ["Kategori24c2"]= new(MaxFat: 10m,   MaxAddedSugars: 3m, MaxSalt: 2.5m),

            // Cat 25–32 (vegetable alternatives, ready meals, dressings)
            ["Kategori25a"] = new(MaxFat: 10m,   MaxSatFat: 3.5m,  MaxAddedSugars: 3m,   MaxSalt: 1.5m),
            ["Kategori25b"] = new(MaxFat: 10m,   MaxSatFat: 3.5m,  MaxAddedSugars: 3m,   MaxSalt: 1m),
            ["Kategori26"]  = new(MaxSatFat: 1.8m, MaxAddedSugars: 3m, MaxSalt: 0.8m),
            ["Kategori27"]  = new(MaxSatFat: 1.5m, MaxAddedSugars: 3m, MaxSalt: 0.8m),
            ["Kategori28"]  = new(MaxSatFat: 2.0m, MaxAddedSugars: 3m, MaxSalt: 1.0m),
            ["Kategori29"]  = new(MaxSatFat: 2.0m, MaxAddedSugars: 3m, MaxSalt: 0.9m),
            ["Kategori30"]  = new(MaxSatFat: 1.5m, MaxAddedSugars: 3m, MaxSalt: 0.8m),
            ["Kategori31"]  = new(DynamicSatFatFraction: 0.2m,  MaxTotalSugars: 5m,            MaxSalt: 0.8m),
            ["Kategori32"]  = new(MaxFat: 5m,    DynamicSatFatFraction: 0.33m, MaxTotalSugars: 5m, MaxSalt: 0.8m),
        };

        public CalculatorService(IWebHostEnvironment env, IEuHealthClaimsService euHealthClaims)
        {
            _euHealthClaims = euHealthClaims;
            var path = Path.Combine(env.ContentRootPath, "Data", "health_claims.json");
            var json = File.ReadAllText(path);
            _healthClaims = JsonSerializer.Deserialize<List<HealthClaimEntry>>(json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                })
                ?? new List<HealthClaimEntry>();
        }

        public async Task<CalculatorResponseDTO> Calculate(CalculatorRequestDTO request)
        {
            var efsaNutritionClaims = CheckEfsaNutritionClaims(request.FoodType, request.EnergyUnit, request.Nutrition);

            var starchHealthClaims = new List<HealthClaimResultDTO>();
            var resistantStarchClaim = await CheckResistantStarchHealthClaim(request.Nutrition);
            if (resistantStarchClaim != null) starchHealthClaims.Add(resistantStarchClaim);

            return new CalculatorResponseDTO
            {
                HasNokkelhullet = CheckNokkelhullet(request.Category, request.Nutrition),
                EfsaNutritionClaims = efsaNutritionClaims,
                EfsaHealthClaims = starchHealthClaims,
                IngredientHealthClaims = await CheckHealthClaims(request.Nutrition, request.EnergyUnit, request.PortionSize, request.Vitamins, request.Minerals, request.Others),
            };
        }

        // ── Nøkkelhullet ────────────────────────────────────────────────────────

        private bool? CheckNokkelhullet(string category, NutritionInputDTO n)
        {
            if (n.EnergyKcal == 0 && n.EnergyKj == 0)
                return null;

            if (AlwaysPassCategories.Contains(category))
                return true;

            if (!NokkelhulletThresholds.TryGetValue(category, out var t))
                return null;

            return (!t.MaxFat.HasValue                || n.Fat          <= t.MaxFat.Value)
                && (!t.MaxSatFat.HasValue             || n.SaturatedFat <= t.MaxSatFat.Value)
                && (!t.DynamicSatFatFraction.HasValue || n.SaturatedFat <= n.Fat * t.DynamicSatFatFraction.Value)
                && (!t.MaxTotalSugars.HasValue        || (n.NaturalSugars + n.AddedSugars) <= t.MaxTotalSugars.Value)
                && (!t.MaxAddedSugars.HasValue        || n.AddedSugars  <= t.MaxAddedSugars.Value)
                && (!t.MinFibre.HasValue              || n.Fibre        >= t.MinFibre.Value)
                && (!t.MaxSalt.HasValue               || n.Salt         <= t.MaxSalt.Value);
        }

        // ── EFSA Nutrition Claims ────────────────────────────────────────────────

        private List<string> CheckEfsaNutritionClaims(string foodType, string energyUnit, NutritionInputDTO n)
        {
            if (n.EnergyKcal == 0 && n.EnergyKj == 0)
                return new List<string>();

            // Scoped to energy- and fiber-related claims only for now — the other
            // predicates below (fat, sugar, protein, sodium, light/lite) are kept
            // for when that scope expands again, just not surfaced here yet.
            var passing = new List<string>();

            if (ClaimLowEnergy(n, foodType, energyUnit))          passing.Add("Lavt Energiinnhold");
            if (ClaimEnergyFree(foodType, energyUnit, n))         passing.Add("Energifri");
            if (ClaimHighFibre(foodType, energyUnit, n))          passing.Add("Høyt Fiberinnhold");
            if (ClaimSourceOfFibre(energyUnit, n))                passing.Add("Kostfiberkilde");
            if (ClaimIncreasedHighFibre(foodType, energyUnit, n)) passing.Add("Økt innhold av høyt kostfiberinnhold");
            if (ClaimReducedHighFibre(foodType, energyUnit, n))   passing.Add("Redusert innhold av høyt kostfiberinnhold");
            if (ClaimLowSugars(foodType, n.NaturalSugars, n.AddedSugars)) passing.Add("Lavt sukkerinnhold");
            if (ClaimSugarsFree(n.NaturalSugars, n.AddedSugars))          passing.Add("Sukkerfri");
            if (ClaimWithNoAddedSugars(n.Carbs, n.AddedSugars))           passing.Add("Uten tilsatt sukker");

            // Uncomment each line below to enable the corresponding claim:
            // if (ClaimLowFat(foodType, n.Fat))                                passing.Add("Lavt fettinnhold");
            // if (ClaimFatFree(n.Fat))                                         passing.Add("Fettfri");
            // if (ClaimLowSaturatedFat(foodType, energyUnit, n))               passing.Add("Lavt innhold av mettet fett");
            // if (ClaimSaturatedFatFree(n.SaturatedFat, n.TransFat))           passing.Add("Fri for mettet fett");
            // if (ClaimSourceOfProtein(energyUnit, n))                         passing.Add("Proteinkilde");
            // if (ClaimHighProtein(energyUnit, n))                             passing.Add("Høyt proteininnhold");
            // if (ClaimLowSodium(n.Salt))                                      passing.Add("Lavt saltinnhold");
            // if (ClaimVeryLowSodium(n.Salt))                                  passing.Add("Svært lavt saltinnhold");
            // if (ClaimSodiumFree(n.Salt))                                     passing.Add("Saltfri");
            // if (ClaimNoAddedSodium(n.Salt, n.AddedSalt))                     passing.Add("Uten tilsatt salt");
            // if (ClaimLightLite(n))                                           passing.Add("Lett/Lite");

            return passing;
        }

        private static bool ClaimLowEnergy(NutritionInputDTO n, string foodType, string energyUnit)
        {
            bool liquid = foodType == "liquid";
            if (energyUnit == "energikcal")
                return liquid ? n.EnergyKcal <= 20 : n.EnergyKcal <= 40;
            return liquid ? n.EnergyKj <= 80 : n.EnergyKj <= 170;
        }

        // EFSA Annex only defines "energy-free" per 100 ml — there's no solid-food
        // variant, so this claim never applies to foodType "solid".
        private static bool ClaimEnergyFree(string foodType, string energyUnit, NutritionInputDTO n)
        {
            if (foodType != "liquid") return false;
            return energyUnit == "energikcal" ? n.EnergyKcal <= 4 : n.EnergyKj <= 17;
        }

        private static bool ClaimLowFat(string foodType, decimal fat) =>
            foodType == "solid" ? fat <= 3 : fat <= 1.5m;

        private static bool ClaimFatFree(decimal fat) => fat <= 0.5m;

        private static bool ClaimLowSaturatedFat(string foodType, string energyUnit, NutritionInputDTO n)
        {
            // The gram threshold applies to saturated fat alone, but the "no more than 10% of
            // energy" condition is defined on the sum of saturated AND trans fatty acids.
            decimal satPlusTransFat = n.SaturatedFat + n.TransFat;
            decimal satPlusTransFatEnergy = energyUnit == "energikcal"
                ? satPlusTransFat * 9
                : satPlusTransFat * 38;

            decimal tenPctEnergy = energyUnit == "energikcal"
                ? n.EnergyKcal * 0.9m
                : n.EnergyKj * 0.9m;

            return foodType == "solid"
                ? n.SaturatedFat <= 1.5m && satPlusTransFatEnergy <= tenPctEnergy
                : n.SaturatedFat <= 0.75m && satPlusTransFatEnergy <= tenPctEnergy;
        }

        private static bool ClaimSaturatedFatFree(decimal satFat, decimal transFat) => satFat + transFat <= 0.1m;

        private static bool ClaimLowSugars(string foodType, decimal naturalSugars, decimal addedSugars)
        {
            decimal total = naturalSugars + addedSugars;
            return foodType == "solid" ? total <= 5 : total <= 2.5m;
        }

        private static bool ClaimSugarsFree(decimal naturalSugars, decimal addedSugars) =>
            naturalSugars + addedSugars <= 0.5m;

        private static bool ClaimWithNoAddedSugars(decimal carbs, decimal addedSugars) =>
            carbs > 0 && addedSugars == 0;

        private static bool ClaimHighFibre(string foodType, string energyUnit, NutritionInputDTO n)
        {
            // ≥6g per 100g (absolute threshold, no energy condition)
            if (n.Fibre >= 6m) return true;
            // ≥3g per 100 kcal
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Fibre * 100m / n.EnergyKcal >= 3m;
            // ≥3g per 418.4 kJ (same threshold in kJ units)
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Fibre * 100m / n.EnergyKj >= 0.717m;
            return false;
        }

        private static bool ClaimSourceOfProtein(string energyUnit, NutritionInputDTO n)
        {
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Protein * 4m / n.EnergyKcal >= 0.12m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Protein * 17m / n.EnergyKj >= 0.12m;
            return false;
        }

        private static bool ClaimReducedFat(decimal fat) => fat <= 2.1m;

        private static bool ClaimReducedSaturatedFat(decimal satFat) => satFat <= 1.05m;

        private static bool ClaimReducedSalt(decimal salt) => salt <= 0.09m;

        private static bool ClaimHighProtein(string energyUnit, NutritionInputDTO n)
        {
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Protein * 4m / n.EnergyKcal >= 0.20m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Protein * 17m / n.EnergyKj >= 0.20m;
            return false;
        }

        private static bool ClaimLowSodium(decimal salt) => salt <= 0.12m;

        private static bool ClaimVeryLowSodium(decimal salt) => salt <= 0.04m;

        private static bool ClaimSodiumFree(decimal salt) => salt <= 0.005m;

        private static bool ClaimNoAddedSodium(decimal salt, decimal addedSalt) =>
            addedSalt == 0 && salt <= 0.12m;

        private static bool ClaimSourceOfFibre(string energyUnit, NutritionInputDTO n)
        {
            if (n.Fibre >= 3m) return true;
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Fibre * 100m / n.EnergyKcal >= 1.5m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Fibre * 100m / n.EnergyKj >= 0.36m;
            return false;
        }

        private static bool ClaimLightLite(NutritionInputDTO n) =>
            ClaimReducedFat(n.Fat) || ClaimReducedSaturatedFat(n.SaturatedFat) || ClaimReducedSalt(n.Salt);

        private static bool ClaimIncreasedLowFat(string foodType, decimal fat) =>
            foodType == "solid" ? fat <= 3.9m : fat <= 1.95m;

        private static bool ClaimIncreasedHighFibre(string foodType, string energyUnit, NutritionInputDTO n)
        {
            if (foodType != "solid") return false;
            // ≥7.8g per 100g (absolute) OR ≥3.9g per 100 kcal
            if (n.Fibre >= 7.8m) return true;
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Fibre * 100m / n.EnergyKcal >= 3.9m;
            return false;
        }

        private static bool ClaimReducedHighFibre(string foodType, string energyUnit, NutritionInputDTO n)
        {
            if (foodType != "solid") return false;
            // ≥4.2g per 100g (absolute) OR ≥2.1g per 100 kcal
            if (n.Fibre >= 4.2m) return true;
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Fibre * 100m / n.EnergyKcal >= 2.1m;
            return false;
        }

        private static bool ClaimIncreasedLowSatFat(string foodType, decimal satFat) =>
            foodType == "solid" ? satFat <= 1.95m : satFat <= 0.975m;

        // ── EFSA Health Claims ───────────────────────────────────────────────────

        private async Task<List<HealthClaimResultDTO>> CheckHealthClaims(
            NutritionInputDTO n,
            string energyUnit,
            decimal portionSize,
            List<HealthClaimInputDTO> vitamins,
            List<HealthClaimInputDTO> minerals,
            List<OtherClaimInputDTO> others)
        {
            var results = new List<HealthClaimResultDTO>();

            foreach (var v in vitamins)
            {
                decimal amountMg = v.Unit == "µg" ? v.Amount / 1000 : v.Amount;
                results.Add(await BuildHealthClaimResult(v.Name, amountMg, "mg", isOther: false));
            }

            foreach (var m in minerals)
            {
                decimal amountMg = m.Unit == "µg" ? m.Amount / 1000 : m.Amount;
                results.Add(await BuildHealthClaimResult(m.Name, amountMg, "mg", isOther: false));
            }

            foreach (var o in others)
            {
                if (OtherClaimRegistry.TryGetValue(o.Name, out var rules))
                    results.AddRange(await BuildEuOtherClaimResults(o.Name, o.Amount, portionSize, n, energyUnit, rules));
                else
                    results.Add(await BuildHealthClaimResult(o.Name, o.Amount, "g", isOther: true));
            }

            return results;
        }

        // Substances with a known EU Health Claims register entry (OtherClaimRegistry) — each
        // rule is checked against the data this calculator actually collects, rather than the
        // generic "amount >= fixed minimum" fallback used for everything else.
        private async Task<List<HealthClaimResultDTO>> BuildEuOtherClaimResults(
            string nutrient, decimal amount, decimal portionSize, NutritionInputDTO n, string energyUnit,
            OtherClaimRule[] rules)
        {
            var results = new List<HealthClaimResultDTO>();

            foreach (var rule in rules)
            {
                var euClaim = await _euHealthClaims.GetByIdAsync(rule.PolicyItemId);
                if (euClaim == null) continue;

                string meetsReq = rule.Check switch
                {
                    OtherClaimCheck.GramThreshold =>
                        FormatGramThresholdResult(amount, portionSize, rule.MinGrams!.Value),
                    OtherClaimCheck.HighFibreSource =>
                        MeetsHighFibreThreshold(amount, energyUnit, n) ? "Oppfyller gitt krav" : "Oppfyller ikke gitt krav",
                    OtherClaimCheck.BetaGlucanMealRatio =>
                        FormatBetaGlucanMealRatioResult(amount, portionSize, n.Carbs),
                    _ => "Kan ikke beregnes automatisk",
                };

                results.Add(new HealthClaimResultDTO
                {
                    Nutrient = nutrient,
                    Amount = amount > 0 ? $"{amount} g" : "ikke oppgitt",
                    MeetsRequirement = meetsReq,
                    Naeringsmiddel = euClaim.NutrientSubstFood,
                    Pastand = euClaim.Claim,
                    VilkaarForBruk = euClaim.ConditionOfUse,
                    VilkaarOgBegrensninger = euClaim.RestrictionsOfUse,
                    LegislationReference = euClaim.LegislationReference,
                    SourceUrl = euClaim.LegislationUrl,
                    EfsaQuestion = euClaim.EfsaQuestion,
                    EfsaQuestionUrl = euClaim.EfsaQuestionUrl,
                });
            }

            return results;
        }

        // "Food which is high in that fibre" — the specific substance's own amount (not total
        // dietary fibre) must pass the same threshold as the HIGH FIBRE nutrition claim.
        private static bool MeetsHighFibreThreshold(decimal sourceFibreGrams, string energyUnit, NutritionInputDTO n)
        {
            if (sourceFibreGrams >= 6m) return true;
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return sourceFibreGrams * 100m / n.EnergyKcal >= 3m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return sourceFibreGrams * 100m / n.EnergyKj >= 0.717m;
            return false;
        }

        // "At least Xg ... per quantified portion" — Mengde (g/100g) must be scaled to the
        // declared portion before comparing against the fixed gram threshold. Comparing the
        // raw per-100g concentration directly would silently assume the portion is 100g.
        private static string FormatGramThresholdResult(decimal amountPer100g, decimal portionSize, decimal minGrams)
        {
            if (portionSize <= 0) return "Kan ikke beregnes automatisk (porsjonsstørrelse mangler)";
            decimal amountInPortion = amountPer100g * portionSize / 100m;
            return amountInPortion >= minGrams ? "Oppfyller gitt krav" : "Oppfyller ikke gitt krav";
        }

        // "≥4g beta-glucan per 30g available carbohydrates in a quantified portion" — uses this
        // entry's own portion size, not a product-wide serving size.
        private static string FormatBetaGlucanMealRatioResult(decimal betaGlucanPer100g, decimal portionSize, decimal carbsPer100g)
        {
            if (portionSize <= 0) return "Kan ikke beregnes automatisk (porsjonsstørrelse mangler)";
            decimal carbsPerPortion = carbsPer100g * portionSize / 100m;
            if (carbsPerPortion <= 0) return "Kan ikke beregnes automatisk (ingen karbohydrater oppgitt)";
            decimal betaGlucanPerPortion = betaGlucanPer100g * portionSize / 100m;
            return betaGlucanPerPortion / carbsPerPortion >= 4m / 30m ? "Oppfyller gitt krav" : "Oppfyller ikke gitt krav";
        }

        private async Task<HealthClaimResultDTO> BuildHealthClaimResult(string nutrient, decimal amount, string unit, bool isOther)
        {
            var entry = _healthClaims.FirstOrDefault(h =>
                string.Equals(h.Nutrient, nutrient, StringComparison.OrdinalIgnoreCase));
            string fallbackText = entry != null
                ? string.Join(" ", entry.Claims.Select(c => c.Claim))
                : "Ingen påstand funnet for det valgte elementet.";

            string amountDisplay = amount > 0 ? $"{amount} {unit}" : "ikke oppgitt";
            string meetsReq = isOther && OtherMinimumsG.TryGetValue(nutrient, out decimal min)
                ? (amount >= min ? "Oppfyller gitt krav" : "Oppfyller ikke gitt krav")
                : "Ved å velge dette næringsstoffet er man sikker at mengden oppfyller kravet som er vedlagt til forordning (EF) nr. 1924/2006.";

            return new HealthClaimResultDTO
            {
                Nutrient = nutrient,
                Amount = amountDisplay,
                MeetsRequirement = meetsReq,
                Naeringsmiddel = string.Empty,
                Pastand = fallbackText,
                VilkaarForBruk = string.Empty,
                VilkaarOgBegrensninger = string.Empty,
                SourceUrl = string.Empty,
            };
        }

        // "Resistant starch replacing digestible starch ... reduction in blood glucose rise" —
        // requires resistant starch to be at least 14% of the product's total starch.
        private async Task<HealthClaimResultDTO?> CheckResistantStarchHealthClaim(NutritionInputDTO n)
        {
            if (n.TotalStarch <= 0) return null;

            var claim = await _euHealthClaims.GetByIdAsync(ResistantStarchClaimId);
            if (claim == null) return null;

            decimal pct = n.ResistantStarch / n.TotalStarch * 100m;

            return new HealthClaimResultDTO
            {
                Nutrient = "Stivelse",
                Amount = $"{n.ResistantStarch} g resistent stivelse av {n.TotalStarch} g total stivelse ({pct:0.#} %)",
                MeetsRequirement = pct >= 14m ? "Oppfyller gitt krav" : "Oppfyller ikke gitt krav",
                Naeringsmiddel = claim.NutrientSubstFood,
                Pastand = claim.Claim,
                VilkaarForBruk = claim.ConditionOfUse,
                VilkaarOgBegrensninger = claim.RestrictionsOfUse,
                LegislationReference = claim.LegislationReference,
                SourceUrl = claim.LegislationUrl,
                EfsaQuestion = claim.EfsaQuestion,
                EfsaQuestionUrl = claim.EfsaQuestionUrl,
            };
        }

        // ── JSON deserialization models ─────────────────────────────────────────

        private class HealthClaimEntry
        {
            public string Nutrient { get; set; } = string.Empty;
            public List<ClaimEntry> Claims { get; set; } = new();
        }

        private class ClaimEntry
        {
            public string Claim { get; set; } = string.Empty;
            public string Label { get; set; } = string.Empty;
            public ClaimConditions? Conditions { get; set; }
        }

        private class ClaimConditions
        {
            public Dictionary<string, JsonElement>? DosageRequirements { get; set; }
            [JsonConverter(typeof(SingleOrListConverter))]
            public List<string>? Requirement { get; set; }
            public string? Info { get; set; }
            public string? ReferenceRegulation { get; set; }
            public ClaimRestrictions? Restrictions { get; set; }
        }

        private class ClaimRestrictions
        {
            public string? Allowed { get; set; }
        }

        // Handles health_claims.json where "requirement" is sometimes a string, sometimes an array.
        private class SingleOrListConverter : JsonConverter<List<string>?>
        {
            public override List<string>? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.String)
                    return new List<string> { reader.GetString()! };
                if (reader.TokenType == JsonTokenType.StartArray)
                {
                    var list = new List<string>();
                    while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                        list.Add(reader.GetString()!);
                    return list;
                }
                return null;
            }

            public override void Write(Utf8JsonWriter writer, List<string>? value, JsonSerializerOptions options)
            {
                if (value == null) { writer.WriteNullValue(); return; }
                writer.WriteStartArray();
                foreach (var s in value) writer.WriteStringValue(s);
                writer.WriteEndArray();
            }
        }
    }
}
