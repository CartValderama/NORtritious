using Backend.DTO;

namespace Backend.Services
{
    // The form schema: what a category asks for before any value has been entered.
    public partial class CalculatorService
    {
        // ── Form schema ─────────────────────────────────────────────────────────
        //
        // Which inputs a category needs, answered here rather than in the browser. Every
        // rule that reads a nutrition field is represented below, so the form can neither
        // ask for a number nothing will read nor skip one that a rule will.

        // Nutrition-table field keys in the order the form renders them.
        private static readonly string[] NutritionFieldOrder =
            { "fett", "mettede", "transfett", "karbohydrat", "sukkerarter", "kostfiber", "protein", "salt" };

        // Which nutrition field each EFSA claim reads. Mirrors what the Claim* predicates
        // above actually look at, including the disabled ones, so re-enabling a claim brings
        // its input along. Energy claims map to nothing: energy is its own field, not part of
        // the nutrition table.
        private static readonly Dictionary<string, string[]> EfsaClaimInputFields = new()
        {
            ["lowEnergy"] = Array.Empty<string>(),
            ["energyFree"] = Array.Empty<string>(),
            ["highFibre"] = new[] { "kostfiber" },
            ["sourceOfFibre"] = new[] { "kostfiber" },
            ["increasedHighFibre"] = new[] { "kostfiber" },
            ["reducedHighFibre"] = new[] { "kostfiber" },
            ["lowSugars"] = new[] { "sukkerarter" },
            ["sugarsFree"] = new[] { "sukkerarter" },
            ["withNoAddedSugars"] = new[] { "sukkerarter" },
            ["lowFat"] = new[] { "fett" },
            ["fatFree"] = new[] { "fett" },
            // Trans fat is part of the saturated-fat calculation, so both are needed.
            ["lowSaturatedFat"] = new[] { "mettede", "transfett" },
            ["saturatedFatFree"] = new[] { "mettede", "transfett" },
            ["lowSodium"] = new[] { "salt" },
            ["veryLowSodium"] = new[] { "salt" },
            ["sodiumFree"] = new[] { "salt" },
            ["noAddedSodium"] = new[] { "salt" },
            ["sourceOfProtein"] = new[] { "protein" },
            ["highProtein"] = new[] { "protein" },
        };

        // Which nutrition field each Nøkkelhullet limit governs. Read straight off
        // CategoryThreshold rather than from prose, so it can't disagree with the numbers.
        private static IEnumerable<string> NokkelhulletFieldsFor(CategoryThreshold t)
        {
            if (t.MaxFat.HasValue) yield return "fett";
            if (t.MaxSatFat.HasValue || t.DynamicSatFatFraction.HasValue) yield return "mettede";
            if (t.MaxTotalSugars.HasValue || t.MaxAddedSugars.HasValue) yield return "sukkerarter";
            if (t.MinFibre.HasValue) yield return "kostfiber";
            if (t.MaxSalt.HasValue) yield return "salt";
        }

        // Karbohydrat feeds the always-on carbohydrate health claim, so it is always asked for.
        private static readonly string[] AlwaysRelevantFields = { "karbohydrat" };

        // Every field any claim reads, from the whole of EfsaClaimInputFields rather than from
        // the claims one category offers. See the note in BuildSchema for why.
        private static readonly string[] AllClaimInputFields =
            EfsaClaimInputFields.Values.SelectMany(f => f).Distinct().ToArray();

        public CalculatorSchemaDTO BuildSchema(string category, string foodType)
        {
            NokkelhulletThresholds.TryGetValue(category, out var thresholds);

            // The same set for every category, since that is what the calculator will assess.
            // Ordered here rather than taken from the set so the form lists them consistently.
            var claims = EfsaClaimOrder.Where(OfferedEfsaClaims.Contains).ToList();

            var nokkelhulletFields = thresholds is null
                ? new HashSet<string>()
                : NokkelhulletFieldsFor(thresholds).ToHashSet();

            var claimFields = claims.ToDictionary(
                c => c,
                c => EfsaClaimInputFields.GetValueOrDefault(c, Array.Empty<string>()).ToList());

            // Nøkkelhullet is the only thing that varies the form by category. Everything the
            // EFSA claims read is asked for everywhere, because those claims apply everywhere,
            // and a producer filling in the nutrition table has the whole label in front of
            // them either way.
            //
            // Showing a field no claim reads is harmless. The reverse is not, and is what let
            // a hidden Sukkerarter field be sent as a measured 0 and grant "Sukkerfri" to milk.
            var needed = new HashSet<string>(nokkelhulletFields);
            foreach (var f in AllClaimInputFields) needed.Add(f);
            foreach (var f in AlwaysRelevantFields) needed.Add(f);

            return new CalculatorSchemaDTO
            {
                Kilder = KildeOptions,
                Fields = NutritionFieldOrder.Where(needed.Contains).ToList(),
                NokkelhulletFields = NutritionFieldOrder.Where(nokkelhulletFields.Contains).ToList(),
                Claims = claims,
                ClaimFields = claimFields,
                Thresholds = thresholds is null ? null : new NokkelhulletThresholdDTO
                {
                    MaxFat = thresholds.MaxFat,
                    MaxSatFat = thresholds.MaxSatFat,
                    DynamicSatFatFraction = thresholds.DynamicSatFatFraction,
                    MaxTotalSugars = thresholds.MaxTotalSugars,
                    MaxAddedSugars = thresholds.MaxAddedSugars,
                    MinFibre = thresholds.MinFibre,
                    MaxSalt = thresholds.MaxSalt,
                },
            };
        }
    }
}
