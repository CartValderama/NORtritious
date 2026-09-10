using Backend.DTO;

namespace Backend.Services
{
    // EFSA nutrition claims: which are offered per matkategori, and whether each is met.
    public partial class CalculatorService
    {
        // Every claim the calculator evaluates, and by the product owner's decision each one
        // applies to every matkategori. Their scope list states the claims and their
        // conditions per claim, not per food group, so nothing here is filtered by category.
        //
        // This replaced a per-category curation transcribed from their workbook ("Final Excel
        // mapped with EFSA claims", rev 19-04, column "Nutrition claims"). That mapping listed
        // up to 20 claims for a group, most of them claims this calculator doesn't implement,
        // and its effect on the six that are implemented was to withhold them: group 1 never
        // offered the fibre claims, for instance. It is recoverable from the workbook if the
        // decision reverses; it is not reproduced here because a dictionary nothing reads is
        // worse than no dictionary.
        //
        // The gate it provided is no longer load-bearing either. It was what stopped
        // "Sukkerfri" being granted to milk and fruit, but that bug came from the Sukkerarter
        // field being hidden and submitted as a fabricated 0. The schema shows that field for
        // every category now, so the zero has to be typed to be believed.
        //
        // ENERGY-REDUCED and the other reduced/increased claims stay out: they compare against
        // a reference product, and the form collects no reference product to compare with.
        private static readonly HashSet<string> OfferedEfsaClaims = new()
        {
            "lowEnergy",
            "energyFree",
            "highFibre",
            "sourceOfFibre",
            "lowSugars",
            "sugarsFree",
        };

        private static bool Offers(string category, string claimKey) =>
            OfferedEfsaClaims.Contains(claimKey);

        // The order BuildEfsaNutritionClaimResults produces them in, so the schema can list
        // them the same way instead of in whatever order the set happens to enumerate.
        private static readonly string[] EfsaClaimOrder =
        {
            "lowEnergy",
            "energyFree",
            "highFibre",
            "sourceOfFibre",
            "lowSugars",
            "sugarsFree",
        };

        // ── EFSA Nutrition Claims ────────────────────────────────────────────────

        // The Norwegian sentence shown with each claim, one for met and one for not met.
        // Ported from CLAIMS_CONFIG in the frontend, which restated these limits in prose
        // beside a second copy of them in code.
        private record ClaimCopy(string MetText, string NotMetText);

        private static readonly Dictionary<string, ClaimCopy> EfsaClaimCopy = new()
        {
            ["lowEnergy"] = new(
                "Dette produktet inneholder høyst 40 kcal / 170 kJ per 100 g for næringsmidler i fast form, "
                + "eller høyst 20 kcal / 80 kJ per 100 ml for næringsmidler i flytende form.",
                "For faste næringsmidler, må energinivået være høyst 40 kcal / 170 kJ per 100 g. "
                + "For flytende næringsmidler, må energinivået være høyst 20 kcal / 80 kJ per 100 ml."),
            ["energyFree"] = new(
                "Dette produktet inneholder høyst 4 kcal / 17 kJ per 100 g.",
                "Energinivået må være høyst 4 kcal / 17 kJ per 100 g."),
            ["highFibre"] = new(
                "Dette produktet inneholder minst 6 g fiber per 100 g eller minst 3 g fiber per 100 kcal.",
                "Kravet er minst 6 g fiber per 100 g, eller minst 3 g fiber per 100 kcal "
                + "(husk å bruke kcal som energienhet)."),
            ["sourceOfFibre"] = new(
                "Dette produktet inneholder minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.",
                "Kravet er minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal."),
            ["lowSugars"] = new(
                "Dette produktet inneholder høyst 5 g sukkerarter per 100 g (fast form) eller høyst 2,5 g "
                + "per 100 ml (flytende form).",
                "For faste næringsmidler må sukkerinnholdet være høyst 5 g per 100 g. "
                + "For flytende næringsmidler må sukkerinnholdet være høyst 2,5 g per 100 ml."),
            ["sugarsFree"] = new(
                "Dette produktet inneholder høyst 0,5 g sukkerarter per 100 g eller 100 ml.",
                "Kravet er høyst 0,5 g sukkerarter per 100 g eller 100 ml."),
        };

        private static string ExplanationFor(string claimKey, bool met) =>
            EfsaClaimCopy.TryGetValue(claimKey, out var copy)
                ? (met ? copy.MetText : copy.NotMetText)
                : string.Empty;

        // Every claim offered for this category and food type, met or not, with the figures
        // the verdict was reached on. Met comes from the same Claim* predicate the calculator
        // has always used, so the numbers reported here describe that verdict rather than
        // recomputing it, and a threshold can't be changed in one place and not the other.
        //
        // Exactly 6 claims are in active use: energy, fibre (plain High/Source only, no
        // increased/reduced variants) and sugar. The rest of the Claim* predicates below are
        // kept but not called from anywhere, for when scope expands again.
        //
        // Every one of them is offered for every matkategori; only its own threshold decides
        // whether it is met. See OfferedEfsaClaims for why the per-category curation went.
        private static List<EfsaNutritionClaimDTO> BuildEfsaNutritionClaimResults(
            string category, string foodType, string energyUnit, NutritionInputDTO n)
        {
            bool liquid = foodType == "liquid";
            bool useKj = energyUnit == "energikj";
            decimal energy = useKj ? n.EnergyKj : n.EnergyKcal;
            string energyUnitLabel = useKj ? "kJ" : "kcal";
            string per100 = liquid ? "100 ml" : "100 g";
            decimal sugars = n.NaturalSugars + n.AddedSugars;

            var results = new List<EfsaNutritionClaimDTO>();

            void Add(string key, string name, bool met, decimal actual, string actualUnit,
                     string comparator, decimal threshold, string thresholdUnit)
            {
                if (!Offers(category, key)) return;
                results.Add(new EfsaNutritionClaimDTO
                {
                    Key = key, Label = name, Passed = met,
                    ActualValue = actual, ActualUnit = actualUnit,
                    Comparator = comparator, ThresholdValue = threshold, ThresholdUnit = thresholdUnit,
                    Explanation = ExplanationFor(key, met),
                });
            }

            Add("lowEnergy", "Lavt Energiinnhold", ClaimLowEnergy(n, foodType, energyUnit),
                energy, energyUnitLabel, "≤",
                useKj ? (liquid ? 80m : 170m) : (liquid ? 20m : 40m),
                $"{energyUnitLabel}/{per100}");

            // Stated per 100 ml in the Annex and applied to solids too, by the product
            // owner's decision. See ClaimEnergyFree.
            Add("energyFree", "Energifri", ClaimEnergyFree(energyUnit, n),
                energy, energyUnitLabel, "≤",
                useKj ? 17m : 4m, $"{energyUnitLabel}/{per100}");

            // Both fibre claims have an alternative per-100-kcal basis. Reporting only the
            // per-100 g figure made a claim that passed on the energy basis look like it had
            // failed its own threshold, so whichever basis actually carried it is the one
            // reported.
            AddFibreClaim(results, category, "highFibre", "Høyt Fiberinnhold",
                ClaimHighFibre(foodType, energyUnit, n), 6m, 3m, 0.717m, energyUnit, n, per100);
            AddFibreClaim(results, category, "sourceOfFibre", "Kostfiberkilde",
                ClaimSourceOfFibre(energyUnit, n), 3m, 1.5m, 0.36m, energyUnit, n, per100);

            Add("lowSugars", "Lavt sukkerinnhold", ClaimLowSugars(foodType, n.NaturalSugars, n.AddedSugars),
                sugars, "g", "≤", liquid ? 2.5m : 5m, $"g/{per100}");

            Add("sugarsFree", "Sukkerfri", ClaimSugarsFree(n.NaturalSugars, n.AddedSugars),
                sugars, "g", "≤", 0.5m, "g/100 g eller 100 ml");

            return results;
        }

        // The fibre claims qualify on either "at least X g per 100 g" or "at least Y g per
        // 100 kcal". The per-100 g figure is the primary one, so it's reported unless the
        // product only cleared the energy-based alternative.
        private static void AddFibreClaim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, decimal perHundredGrams, decimal perHundredKcal, decimal perHundredKj,
            string energyUnit, NutritionInputDTO n, string per100)
        {
            if (!Offers(category, key)) return;

            bool clearsPerHundredGrams = n.Fibre >= perHundredGrams;
            bool useEnergyBasis = met && !clearsPerHundredGrams;

            decimal energy = energyUnit == "energikcal" ? n.EnergyKcal : n.EnergyKj;
            decimal perEnergyThreshold = energyUnit == "energikcal" ? perHundredKcal : perHundredKj;
            string energyLabel = energyUnit == "energikcal" ? "kcal" : "kJ";

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met, Comparator = "≥", ActualUnit = "g",
                Explanation = ExplanationFor(key, met),
                ActualValue = useEnergyBasis && energy > 0
                    ? Math.Round(n.Fibre * 100m / energy, 2)
                    : n.Fibre,
                ThresholdValue = useEnergyBasis ? perEnergyThreshold : perHundredGrams,
                ThresholdUnit = useEnergyBasis ? $"g/100 {energyLabel}" : $"g/{per100}",
            });
        }

        // ── Claims that are implemented but not offered ──────────────────────────
        //
        // Everything from here down is a Claim* predicate. Only the six called from
        // BuildEfsaNutritionClaimResults above are live; the rest are kept against the day
        // scope widens, and each would need a row in OfferedEfsaClaims, EfsaClaimOrder,
        // EfsaClaimCopy and EfsaClaimInputFields before it could be added there:
        //
        //   ClaimWithNoAddedSugars   Uten tilsatt sukker
        //   ClaimIncreasedFibre      Økt innhold av høyt kostfiberinnhold
        //   ClaimReducedFibre        Redusert innhold av høyt kostfiberinnhold
        //   ClaimLowFat              Lavt fettinnhold
        //   ClaimFatFree             Fettfri
        //   ClaimLowSaturatedFat     Lavt innhold av mettet fett
        //   ClaimSaturatedFatFree    Fri for mettet fett
        //   ClaimSourceOfProtein     Proteinkilde
        //   ClaimHighProtein         Høyt proteininnhold
        //   ClaimLowSodium           Lavt saltinnhold
        //   ClaimVeryLowSodium       Svært lavt saltinnhold
        //   ClaimSodiumFree          Saltfri
        //   ClaimNoAddedSodium       Uten tilsatt salt
        //   ClaimLightLite           Lett/Lite
        //
        // Uten tilsatt sukker is the one that can't simply be switched on: the form no longer
        // collects added sugar separately from natural sugar (single "Sukkerarter" field, at
        // the client's request), so AddedSugars here is always the full sugar total and is
        // never provably zero for a product that does contain sugar.

        private static bool ClaimLowEnergy(NutritionInputDTO n, string foodType, string energyUnit)
        {
            bool liquid = foodType == "liquid";
            if (energyUnit == "energikcal")
                return liquid ? n.EnergyKcal <= 20 : n.EnergyKcal <= 40;
            return liquid ? n.EnergyKj <= 80 : n.EnergyKj <= 170;
        }

        // The Annex to Regulation (EC) No 1924/2006 writes ENERGY-FREE as "no more than
        // 4 kcal (17 kJ)/100 ml", i.e. for liquids only, unlike LOW ENERGY which states a
        // figure for each food type. The same limit is applied to solids here by the product
        // owner's decision: the Annex gives no separate solid figure, and refusing the claim
        // to solids outright would be its own kind of wrong answer.
        //
        // NOT CHECKED, and can't be yet: the sub-clause "For table-top sweeteners the limit
        // of 0,4 kcal (1,7 kJ)/portion, with equivalent sweetening properties to 6 g of
        // sucrose (approximately 1 teaspoon of sucrose), applies." Testing it needs two
        // things the form doesn't collect, a "table-top sweetener" product type and the
        // product's sweetening power relative to sucrose. So a table-top sweetener is judged
        // against the 4 kcal figure, which is not the figure the Annex gives it.
        private static bool ClaimEnergyFree(string energyUnit, NutritionInputDTO n) =>
            energyUnit == "energikcal" ? n.EnergyKcal <= 4 : n.EnergyKj <= 17;

        private static bool ClaimLowFat(string foodType, decimal fat) =>
            foodType == "solid" ? fat <= 3 : fat <= 1.5m;

        private static bool ClaimFatFree(decimal fat) => fat <= 0.5m;

        // "LOW SATURATED FAT ... may only be made if the sum of saturated fatty acids and
        // trans-fatty acids in the product does not exceed 1,5 g per 100 g for solids or
        // 0,75 g/100 ml for liquids and in either case the sum of saturated fatty acids and
        // trans-fatty acids must not provide more than 10% of energy."
        //
        // Both conditions are on the sum, not on saturated fat alone. Energy conversion factor
        // for fat is 9 kcal/g and 37 kJ/g (Annex XIV to Regulation (EU) No 1169/2011).
        private static bool ClaimLowSaturatedFat(string foodType, string energyUnit, NutritionInputDTO n)
        {
            decimal satPlusTransFat = n.SaturatedFat + n.TransFat;
            decimal satPlusTransFatEnergy = energyUnit == "energikcal"
                ? satPlusTransFat * 9m
                : satPlusTransFat * 37m;

            decimal tenPctEnergy = energyUnit == "energikcal"
                ? n.EnergyKcal * 0.1m
                : n.EnergyKj * 0.1m;

            decimal gramLimit = foodType == "solid" ? 1.5m : 0.75m;

            return satPlusTransFat <= gramLimit && satPlusTransFatEnergy <= tenPctEnergy;
        }

        private static bool ClaimSaturatedFatFree(decimal satFat, decimal transFat) => satFat + transFat <= 0.1m;

        private static bool ClaimLowSugars(string foodType, decimal naturalSugars, decimal addedSugars)
        {
            decimal total = naturalSugars + addedSugars;
            return foodType == "solid" ? total <= 5 : total <= 2.5m;
        }

        // One threshold for both solids and liquids ("per 100 g or 100 ml" in the
        // Annex to Regulation (EC) No 1924/2006), unlike LOW SUGARS which splits
        // by food type. Don't confuse the two: 5 g is the low-sugars figure for
        // solids, and using it here would clear products that legally can't carry
        // the claim.
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

        // "REDUCED [NAME OF THE NUTRIENT] ... may only be made where the reduction in content
        // is at least 30% compared to a similar product, except for micronutrients, where a
        // 10 % difference [...] shall be acceptable, and for sodium, or the equivalent value
        // for salt, for which a 25 % difference shall be acceptable."
        //
        // The comparison is against a similar product, not against a fixed number, so each of
        // these needs that product's value passed in. The calculator collects no such input
        // today, which is why they stay disabled: enabling them means adding a reference
        // product to the form first. They previously used fixed thresholds (2,1 g fat and so
        // on), which is not what the Annex says and would have passed or failed products on a
        // rule that doesn't exist.
        private const decimal ReducedFraction = 0.30m;
        private const decimal ReducedSodiumFraction = 0.25m;

        private static bool ClaimReduced(decimal value, decimal reference, decimal fraction) =>
            reference > 0 && value <= reference * (1m - fraction);

        private static bool ClaimReducedFat(decimal fat, decimal referenceFat) =>
            ClaimReduced(fat, referenceFat, ReducedFraction);

        private static bool ClaimReducedSaturatedFat(decimal satFat, decimal referenceSatFat) =>
            ClaimReduced(satFat, referenceSatFat, ReducedFraction);

        private static bool ClaimReducedSalt(decimal salt, decimal referenceSalt) =>
            ClaimReduced(salt, referenceSalt, ReducedSodiumFraction);

        private static bool ClaimHighProtein(string energyUnit, NutritionInputDTO n)
        {
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Protein * 4m / n.EnergyKcal >= 0.20m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Protein * 17m / n.EnergyKj >= 0.20m;
            return false;
        }

        // The Annex states each of these as a sodium figure "or the equivalent value for
        // salt", and this calculator collects salt, not sodium. Annex I to Regulation (EU)
        // No 1169/2011 fixes the conversion: "salt equivalent content = sodium × 2,5". So the
        // sodium figure is multiplied up before comparing, rather than compared to a salt
        // value directly, which was 2,5 times stricter than the rule and would have refused
        // the claim to products entitled to it.
        private const decimal SaltPerSodium = 2.5m;

        // "no more than 0,12 g of sodium ... per 100 g or per 100 ml" = 0,3 g salt.
        private static bool ClaimLowSodium(decimal salt) => salt <= 0.12m * SaltPerSodium;

        // "no more than 0,04 g of sodium ..." = 0,1 g salt.
        private static bool ClaimVeryLowSodium(decimal salt) => salt <= 0.04m * SaltPerSodium;

        // "no more than 0,005 g of sodium ... per 100 g" = 0,0125 g salt.
        private static bool ClaimSodiumFree(decimal salt) => salt <= 0.005m * SaltPerSodium;

        // "does not contain any added sodium/salt or any other ingredient containing added
        // sodium/salt and the product contains no more than 0,12 g sodium ..." = 0,3 g salt.
        private static bool ClaimNoAddedSodium(decimal salt, decimal addedSalt) =>
            addedSalt == 0 && salt <= 0.12m * SaltPerSodium;

        private static bool ClaimSourceOfFibre(string energyUnit, NutritionInputDTO n)
        {
            if (n.Fibre >= 3m) return true;
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Fibre * 100m / n.EnergyKcal >= 1.5m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Fibre * 100m / n.EnergyKj >= 0.36m;
            return false;
        }

        // "LIGHT/LITE ... shall follow the same conditions as those set for the term
        // 'reduced'", so it needs the same comparison product the reduced claims do.
        private static bool ClaimLightLite(
            NutritionInputDTO n, decimal referenceFat, decimal referenceSatFat, decimal referenceSalt) =>
            ClaimReducedFat(n.Fat, referenceFat)
            || ClaimReducedSaturatedFat(n.SaturatedFat, referenceSatFat)
            || ClaimReducedSalt(n.Salt, referenceSalt);

        // "INCREASED [NAME OF THE NUTRIENT] ... may only be made where the product meets the
        // conditions for the claim 'source of' and the increase in content is at least 30%
        // compared to a similar product."
        //
        // Both halves matter, and the old versions had neither: they tested the HIGH FIBRE
        // threshold moved up or down by 30 % (7,8 g and 4,2 g), which reads the 30 % as
        // applying to the claim's own limit instead of to a comparison product. They were also
        // gated to solids, which the Annex doesn't say.
        private static bool ClaimIncreasedFibre(string energyUnit, NutritionInputDTO n, decimal referenceFibre) =>
            ClaimSourceOfFibre(energyUnit, n)
            && referenceFibre > 0
            && n.Fibre >= referenceFibre * (1m + ReducedFraction);

        private static bool ClaimReducedFibre(NutritionInputDTO n, decimal referenceFibre) =>
            ClaimReduced(n.Fibre, referenceFibre, ReducedFraction);
    }
}
