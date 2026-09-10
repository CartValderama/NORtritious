using System.Globalization;
using Backend.DTO;

namespace Backend.Services
{
    // The calculator's entry points and the state every part of it shares.
    //
    // The rules themselves are split across partials by regime, because they are
    // separate bodies of law and were being read past each other in one 1 400-line file:
    //
    //   CalculatorService.Nokkelhullet.cs    per-category thresholds (Nokkelhullet forskrift)
    //   CalculatorService.EfsaNutrition.cs   nutrition claims (Reg. (EC) No 1924/2006 Annex)
    //   CalculatorService.EfsaHealth.cs      health claims (EU register, fetched by id)
    //   CalculatorService.Schema.cs          which inputs and claims a category needs
    //
    // Static field initialisers run in textual order within one file but in unspecified
    // order across the parts of a partial class, so a static that is derived from another
    // static has to be declared in the same file as the one it reads. KildeOptions is the
    // only one, and it sits with the registries it projects.
    public partial class CalculatorService
    {
        // Norway uses a comma as the decimal separator (e.g. "0,5" not "0.5") — every number
        // shown to the user in a health-claim message or amount display goes through this
        // instead of raw string interpolation, which defaults to "." regardless of locale.
        private static readonly CultureInfo NorwegianCulture = CultureInfo.GetCultureInfo("nb-NO");
        private static string FormatNo(decimal value) => value.ToString(NorwegianCulture);

        // Openings the frontend keys its neutral "not assessed" card state off, instead of
        // colouring these like a failure. A condition the calculator can't evaluate is not the
        // same thing as a condition the product failed, and showing them alike tells someone
        // their product fell short when nothing of the sort was established.
        // "Beregnes" is for a missing input, "vurderes" for a condition that isn't arithmetic.
        private const string CannotComputePrefix = "Kan ikke beregnes automatisk";
        private const string CannotAssessPrefix = "Kan ikke vurderes automatisk";

        // Every verdict in here is about the product's composition, and only that. Several
        // claims carry conditions the calculator can't see: a duty to print something on the
        // label (the beta-glucan and wheat bran "daily intake" sentences), how the food is
        // eaten (760137's "as part of the meal"), how it was formulated (764557's "digestible
        // starch has been replaced by"), or what kind of product it is (755405's "only for
        // food supplements"). None of those are downgraded to a partial verdict. They are
        // reported in full through VilkaarForBruk on every card, and satisfying them is the
        // producer's job. The alternative was tried and dropped: flagging them made a
        // qualifying product look uncertain, and drawing the line consistently would have
        // caught the resistant starch claim too.
        private const string MeetsRequirementText = "Oppfyller gitt krav";

        // Every claim in this service comes from the EU Health Claims register through
        // IEuHealthClaimsService.GetByIdAsync. Data/health_claims.json is deliberately not
        // read here any more: it was a hand-maintained copy that returned claim text with no
        // condition of use and no source links, and a name that didn't match it fell through
        // to "Ingen påstand funnet". A substance with no registered claim is now skipped
        // rather than answered from a second, unverifiable source.
        private readonly IEuHealthClaimsService _euHealthClaims;

        public CalculatorService(IEuHealthClaimsService euHealthClaims)
        {
            _euHealthClaims = euHealthClaims;
        }

        public async Task<CalculatorResponseDTO> Calculate(CalculatorRequestDTO request)
        {
            // Every register entry this request will need, fetched in one parallel batch. The
            // builders below still ask for their own claims one at a time, which reads better
            // and keeps each of them responsible for its own scope; after this line those asks
            // are served from memory. On a cold cache the difference was 17 s and about one.
            await _euHealthClaims.PrefetchAsync(CollectClaimIds(request));

            var autoHealthClaims = new List<HealthClaimResultDTO>();
            var resistantStarchClaim = await CheckResistantStarchHealthClaim(request.Nutrition);
            if (resistantStarchClaim != null) autoHealthClaims.Add(resistantStarchClaim);

            var nokkelhulletRequirements = BuildNokkelhulletRequirements(request.Category, request.Nutrition);

            // No energy entered means nothing was assessed, so the breakdown is withheld too
            // rather than shown against a verdict of null.
            bool assessed = request.Nutrition.EnergyKcal != 0 || request.Nutrition.EnergyKj != 0;

            // The names and the breakdown are two views of one evaluation, so it runs once.
            // Building the list twice also meant two places could disagree about which claims
            // were offered.
            var efsaNutritionClaims = assessed
                ? BuildEfsaNutritionClaimResults(request.Category, request.FoodType, request.EnergyUnit, request.Nutrition)
                : new List<EfsaNutritionClaimDTO>();

            return new CalculatorResponseDTO
            {
                HasNokkelhullet = CheckNokkelhullet(request.Category, request.Nutrition, nokkelhulletRequirements),
                NokkelhulletRequirements = assessed ? nokkelhulletRequirements : new(),
                EfsaNutritionClaims = efsaNutritionClaims.Where(c => c.Passed).Select(c => c.Label).ToList(),
                EfsaNutritionClaimResults = efsaNutritionClaims,
                EfsaHealthClaims = autoHealthClaims,
                Warnings = BuildWarnings(request.Nutrition, request.FoodType),
                IngredientHealthClaims = await CheckHealthClaims(request.Nutrition, request.FoodType, request.EnergyUnit, request.PortionSize, request.Vitamins, request.Minerals, request.Others),
            };
        }

        // Which register entries the builders below will ask for. This deliberately mirrors
        // their traversals rather than driving them: it exists only to warm the cache, so an
        // id it misses still resolves, at the cost of the round trip this was avoiding.
        private static IEnumerable<long> CollectClaimIds(CalculatorRequestDTO request)
        {
            if (request.Nutrition.TotalStarch > 0)
                yield return ResistantStarchClaimId;

            bool hasCalcium = false, hasVitaminD = false;
            foreach (var input in request.Vitamins.Concat(request.Minerals))
            {
                if (!VitaminMineralDefs.ContainsKey(input.Name)) continue;

                hasCalcium |= string.Equals(input.Name, CalciumName, StringComparison.OrdinalIgnoreCase);
                hasVitaminD |= string.Equals(input.Name, VitaminDName, StringComparison.OrdinalIgnoreCase);

                foreach (var id in SourceOfClaimIds.GetValueOrDefault(input.Name, Array.Empty<long>()))
                    yield return id;
            }

            if (hasCalcium && hasVitaminD)
                yield return CalciumVitaminDPortionClaimId;

            foreach (var other in request.Others)
                if (OtherClaimRegistry.TryGetValue(other.Name, out var rules))
                    foreach (var rule in rules)
                        yield return rule.PolicyItemId;
        }

        // ── Plausibility warnings ───────────────────────────────────────────────
        //
        // Energy conversion factors from Annex XIV to Regulation (EU) No 1169/2011: the kcal
        // and kJ each gram of a macronutrient contributes. The same table ClaimLowSaturatedFat
        // uses for its "10 % of energy" condition.
        private const decimal KcalPerGramFat = 9m, KcalPerGramCarb = 4m, KcalPerGramProtein = 4m, KcalPerGramFibre = 2m;
        private const decimal KjPerGramFat = 37m, KjPerGramCarb = 17m, KjPerGramProtein = 17m, KjPerGramFibre = 8m;

        private static List<string> BuildWarnings(NutritionInputDTO n, string foodType)
        {
            var warnings = new List<string>();
            bool liquid = foodType == "liquid";
            bool hasEnergy = n.EnergyKcal > 0 || n.EnergyKj > 0;
            bool allMacrosZero = n.Fat == 0 && n.Carbs == 0 && n.Protein == 0 && n.Fibre == 0;

            // Energy has to come from somewhere. All four macros at zero with energy entered
            // is impossible for a solid and unusual for a liquid.
            if (hasEnergy && allMacrosZero)
            {
                warnings.Add(liquid
                    ? "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. "
                    + "Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske "
                    + "syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene er riktige."
                    : "Du har oppgitt energi, men fett, karbohydrat, protein og kostfiber er alle satt til 0. "
                    + "Dette er normalt ikke mulig for et fast produkt, siden energi kommer fra disse "
                    + "næringsstoffene. Kontroller verdiene.");
                return warnings;
            }

            // The general case: entered energy should be roughly what the macros add up to.
            decimal entered, expected;
            string unit;
            if (n.EnergyKcal > 0)
            {
                entered = n.EnergyKcal;
                expected = n.Fat * KcalPerGramFat + n.Carbs * KcalPerGramCarb
                         + n.Protein * KcalPerGramProtein + n.Fibre * KcalPerGramFibre;
                unit = "kcal";
            }
            else if (n.EnergyKj > 0)
            {
                entered = n.EnergyKj;
                expected = n.Fat * KjPerGramFat + n.Carbs * KjPerGramCarb
                         + n.Protein * KjPerGramProtein + n.Fibre * KjPerGramFibre;
                unit = "kJ";
            }
            else return warnings;

            if (expected <= 0) return warnings;

            // Half to one and a half times the expected value, generous enough for label
            // rounding and for substances this calculator doesn't track.
            decimal ratio = entered / expected;
            if (ratio >= 0.5m && ratio <= 1.5m) return warnings;

            warnings.Add(
                $"Du har oppgitt {FormatNo(entered)} {unit} energi, mens fett er {FormatNo(n.Fat)} g, "
                + $"karbohydrat er {FormatNo(n.Carbs)} g, protein er {FormatNo(n.Protein)} g og kostfiber "
                + $"er {FormatNo(n.Fibre)} g. "
                + (liquid
                    ? "Dette kan være riktig hvis produktet inneholder alkohol, sukkeralkoholer eller organiske "
                    + "syrer, som ikke registreres i denne kalkulatoren. Kontroller likevel at verdiene stemmer "
                    + "med hverandre."
                    : "Kontroller at disse stemmer med hverandre."));

            return warnings;
        }
    }
}
