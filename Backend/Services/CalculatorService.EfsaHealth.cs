using Backend.DTO;

namespace Backend.Services
{
    // EFSA health claims: the substances in scope, the register ids behind each, and the
    // conditions this calculator can check from what the form collects.
    public partial class CalculatorService
    {
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

        // ── Vitamins and minerals (calcium, vitamin D) ──────────────────────────
        //
        // Scope is deliberately these two only, and only the claims listed in the client's
        // sheet. Every entry below is fetched from the EU register by policy_item_id like the
        // "Other" substances above; nothing here reads health_claims.json.

        // Nutrient reference values from Annex XIII to Regulation (EU) No 1169/2011, which
        // replaced the list in the Annex to Directive 90/496/EEC that the claim conditions
        // still cite. Unit is the one the register states the claim's own amounts in, so a
        // vitamin D figure stays in µg instead of becoming 0,00075 mg.
        private record VitaminMineralDef(string Unit, decimal Nrv);

        // The register's own English names, which are also the keys the form sends back and
        // the keys of every dictionary below. Named rather than repeated as literals so the
        // combined claim's "are both of these present" test can't drift from the registry.
        private const string CalciumName = "Calcium";
        private const string VitaminDName = "Vitamin D";

        // Which of the two are minerals rather than vitamins. Only affects which request
        // list an entry lands in; the backend checks both the same way.
        private static readonly HashSet<string> MineralNames =
            new(StringComparer.OrdinalIgnoreCase) { CalciumName };

        private static readonly Dictionary<string, VitaminMineralDef> VitaminMineralDefs =
            new(StringComparer.OrdinalIgnoreCase)
            {
                [CalciumName] = new("mg", 800m),
                [VitaminDName] = new("µg", 5m),
            };

        // Claims whose whole condition is "food which is at least a source of X". That phrase
        // is a cross-reference, not a number: it points at the SOURCE OF [NAME OF VITAMIN/S]
        // AND/OR [NAME OF MINERAL/S] nutrition claim, which in turn requires a "significant
        // amount": 15 % of the NRV per 100 g, or 7,5 % per 100 ml for beverages. So all of
        // these share one gate and differ only in which claim text is shown.
        private static readonly Dictionary<string, long[]> SourceOfClaimIds =
            new(StringComparer.OrdinalIgnoreCase)
            {
                [CalciumName] = new[] { 757897L, 760473L, 760509L, 760545L, 760581L, 760617L, 760653L },
                [VitaminDName] = new[] { 766997L, 767037L },
            };

        // The one claim in scope naming both nutrients. It only makes sense once calcium and
        // vitamin D have both been entered, so it's built outside the per-nutrient loop.
        //
        // Two parts of its condition are not checked here, both by the product owner's
        // decision after the trade-off was put to them:
        //
        //  - "may be used only for food supplements". There is no product-type input, and the
        //    calculator is for food, so this is left to the reader via Vilkår for bruk rather
        //    than blocking the claim. It is the same treatment the beta-glucan claims get for
        //    their "information shall be given to the consumer" duty.
        //  - The threshold is per daily portion, and Porsjonsstørrelse is a serving. They are
        //    the same quantity only for a product eaten once a day, so the comparison below
        //    assumes that. The condition text states "per daglig porsjon" in full, so whoever
        //    prepares the label can see what was assumed.
        private const long CalciumVitaminDPortionClaimId = 755405;
        private const decimal CalciumVitaminDMinCalciumMg = 400m;
        private const decimal CalciumVitaminDMinVitaminDUg = 15m;

        // Claims shown in the register's own English rather than the machine translation.
        //
        // The free translation endpoint rendered 760473's "blood clotting" as "blodpropp",
        // which in Norwegian names a thrombosis, so the card read "Kalsium bidrar til normal
        // blodpropp". Claim wording is prescribed text that goes onto a label, and a sentence
        // the translator has changed the meaning of is worse than one the reader has to read
        // in English. Writing a Norwegian version here instead would mean inventing wording
        // that isn't sourced from the authorised list, which is its own problem.
        //
        // Add an id here when its translation is found to be wrong. The fix is per claim on
        // purpose: nothing can detect a bad translation automatically, so each one is a
        // judgement someone made by reading it.
        private static readonly HashSet<long> ClaimsShownInEnglish = new() { 760473 };

        // The Norwegian name for each substance the picker offers. The registries above are
        // keyed by the English name the EU register uses, which is also what the request
        // carries, so the result would otherwise be labelled "Calcium" and "Beta-glucans" in
        // an otherwise Norwegian document. Set here rather than translated by each caller, so
        // the card, the saved product and the report can't disagree about what to call it.
        private static readonly Dictionary<string, string> NutrientLabels =
            new(StringComparer.OrdinalIgnoreCase)
            {
                ["Calcium"] = "Kalsium",
                ["Vitamin D"] = "Vitamin D",
                ["Calcium and vitamin D"] = "Kalsium og vitamin D",
                ["Beta-glucans"] = "Beta-glukaner",
                ["Barley beta-glucans"] = "Byggbeta-glukaner",
                ["Oat beta-glucan"] = "Havrebeta-glukan",
                ["Barley grain fibre"] = "Byggfiber",
                ["Rye fibre"] = "Rugfiber",
                ["Wheat bran fibre"] = "Hvetekli-fiber",
                ["Oat grain fibre"] = "Havrefiber",
            };

        private static string NutrientLabel(string name) =>
            NutrientLabels.GetValueOrDefault(name, name);

        // Short link label for the EFSA scientific opinion behind each policy_item_id above (plus
        // ResistantStarchClaimId) — the EU register API only returns a bare citation like
        // "2011;9(6):2249", not a title, so the actual title was looked up and verified by hand
        // for each, then reduced to an invitation to read it ("Les EFSA-uttalelsen om ...") plus
        // just the claimed effect. The frontend appends the fetched citation (EfsaQuestion, not
        // hardcoded) after this in parentheses, so the link still names the source it points to.
        private static readonly Dictionary<long, string> EfsaOpinionTitles = new()
        {
            [760097] = "Les EFSA-uttalelsen om beta-glukaner og blodkolesterol",
            [760137] = "Les EFSA-uttalelsen om beta-glukaner fra havre og bygg",
            [756273] = "Les EFSA-uttalelsen om betaglukaner fra bygg og blodkolesterol",
            [757081] = "Les EFSA-uttalelsen om havrebetaglukan og blodkolesterol",
            [760061] = "Les EFSA-uttalelsen om byggfiber og avføringsvolum",
            [764917] = "Les EFSA-uttalelsen om rugfiber og tarmfunksjon",
            [767477] = "Les EFSA-uttalelsen om hvetekli og tarmpassasje",
            [767513] = "Les EFSA-uttalelsen om hvetekli og avføringsvolum",
            [763813] = "Les EFSA-uttalelsen om havrefiber og avføringsvolum",
            [764557] = "Les EFSA-uttalelsen om resistent stivelse og blodsukker",
            [757897] = "Les EFSA-uttalelsen om kalsium og beinvekst hos barn",
            [760473] = "Les EFSA-uttalelsen om kalsium og blodkoagulering",
            [760509] = "Les EFSA-uttalelsen om kalsium og energiomsetning",
            [760545] = "Les EFSA-uttalelsen om kalsium og muskelfunksjon",
            [760581] = "Les EFSA-uttalelsen om kalsium og nevrotransmisjon",
            [760617] = "Les EFSA-uttalelsen om kalsium og fordøyelsesenzymer",
            [760653] = "Les EFSA-uttalelsen om kalsium og celledeling",
            [755405] = "Les EFSA-uttalelsen om kalsium, vitamin D og tap av beinmineral",
            [766997] = "Les EFSA-uttalelsen om vitamin D og opptak av kalsium og fosfor",
            [767037] = "Les EFSA-uttalelsen om vitamin D og kalsiumnivået i blodet",
        };

        // Resistant starch (764557) isn't a user-selectable "Other" substance like the ones above —
        // its condition needs two dedicated nutrition fields (TotalStarch/ResistantStarch), so it's
        // checked directly from NutritionInputDTO instead, alongside the Karbohydrater claims.
        private const long ResistantStarchClaimId = 764557;

        // Karbohydrater claims (836625 "brain function", 836661 "muscle recovery") were
        // checked directly from NutritionInputDTO.Carbs, but both are dropped:
        // - Brain function (>=20g carbs per quantified portion + low-sugar/no-added-sugar)
        //   removed at product owner's request.
        // - Muscle recovery (4g carbs per kg body weight) is permanently unresolvable — the
        //   calculator has no body-weight input and never will.

        // The kilde picker's options. Neither the category nor the food type changes them, so
        // they're built once at startup rather than per request. Nothing mutates the list or
        // the options in it; they are serialised onto the schema response as they are.
        //
        // Every fibre source in OtherClaimRegistry is a subset of Kostfiber; a vitamin or
        // mineral is not. RequiresPortionSize is read off the rules rather than listed by hand,
        // so a claim that stops being per-portion stops asking for one.
        private static readonly List<KildeOptionDTO> KildeOptions = OtherClaimRegistry
            .Select(entry => new KildeOptionDTO
            {
                Value = entry.Key,
                Label = NutrientLabel(entry.Key),
                Unit = "g",
                Kind = "other",
                RequiresKostfiber = true,
                RequiresPortionSize = entry.Value.Any(r => r.Check == OtherClaimCheck.GramThreshold),
            })
            .Concat(VitaminMineralDefs.Select(entry => new KildeOptionDTO
            {
                Value = entry.Key,
                Label = NutrientLabel(entry.Key),
                Unit = entry.Value.Unit,
                Kind = MineralNames.Contains(entry.Key) ? "mineral" : "vitamin",
                RequiresKostfiber = false,
                // Only the combined calcium and vitamin D claim needs a portion, and it only
                // appears once both are entered, so flagging either one alone would show the
                // hint in cases where it isn't needed.
                RequiresPortionSize = false,
            }))
            .ToList();

        // ── EFSA Health Claims ───────────────────────────────────────────────────

        private async Task<List<HealthClaimResultDTO>> CheckHealthClaims(
            NutritionInputDTO n,
            string foodType,
            string energyUnit,
            decimal portionSize,
            List<HealthClaimInputDTO> vitamins,
            List<HealthClaimInputDTO> minerals,
            List<OtherClaimInputDTO> others)
        {
            var results = new List<HealthClaimResultDTO>();

            // Vitamins and minerals share one path, since the register doesn't treat them
            // differently, and the two request lists exist only because the frontend knows
            // which of its options is which.
            results.AddRange(await BuildVitaminMineralClaimResults(
                vitamins.Concat(minerals).ToList(), foodType, portionSize));

            foreach (var o in others)
            {
                // A name with no registered claim is skipped, the same as an unregistered
                // vitamin or mineral. The picker only offers registry keys, so this can only
                // be reached by a request that didn't come from the form.
                if (OtherClaimRegistry.TryGetValue(o.Name, out var rules))
                    results.AddRange(await BuildEuOtherClaimResults(o.Name, o.Amount, portionSize, n, foodType, energyUnit, rules));
            }

            return results;
        }

        // Substances with a known EU Health Claims register entry (OtherClaimRegistry). Each
        // rule is checked against the data this calculator actually collects.
        private async Task<List<HealthClaimResultDTO>> BuildEuOtherClaimResults(
            string nutrient, decimal amount, decimal portionSize, NutritionInputDTO n, string foodType,
            string energyUnit, OtherClaimRule[] rules)
        {
            var results = new List<HealthClaimResultDTO>();

            foreach (var rule in rules)
            {
                var euClaim = await _euHealthClaims.GetByIdAsync(rule.PolicyItemId);
                if (euClaim == null) continue;

                string meetsReq = rule.Check switch
                {
                    OtherClaimCheck.GramThreshold =>
                        FormatPortionThresholdResult(amount, portionSize, rule.MinGrams!.Value, "g"),
                    OtherClaimCheck.HighFibreSource =>
                        FormatHighFibreSourceResult(amount, energyUnit, n),
                    OtherClaimCheck.BetaGlucanMealRatio =>
                        FormatBetaGlucanMealRatioResult(amount, portionSize, n.Carbs),
                    _ => CannotComputePrefix,
                };

                // Only the per-portion rule compares against something other than the number
                // that was typed in, so only it restates the amount on that basis.
                string amountDisplay = rule.Check == OtherClaimCheck.GramThreshold
                    ? FormatPortionAmount(amount, portionSize, "g", foodType)
                    : FormatPerHundredAmount(amount, "g", foodType);

                results.Add(BuildEuClaimResult(nutrient, amountDisplay, meetsReq, rule.PolicyItemId, euClaim));
            }

            return results;
        }

        // ── Amount shown on a result card ────────────────────────────────────────
        //
        // Whatever number sits next to the verdict has to be the number the verdict was
        // actually reached on. Showing the raw per-100 g input beside a per-portion threshold
        // reads as a contradiction: 250 mg next to a 400 mg requirement, with a green check.
        // So a claim whose threshold is per portion restates the amount per portion, and
        // everything else spells out the per-100 basis it was already on.

        private static string PerHundredLabel(string foodType) =>
            foodType == "liquid" ? "per 100 ml" : "per 100 g";

        private static string FormatPerHundredAmount(decimal amountPer100, string unit, string foodType) =>
            amountPer100 > 0 ? $"{FormatNo(amountPer100)} {unit} {PerHundredLabel(foodType)}" : "ikke oppgitt";

        // Falls back to the per-100 figure when there's no portion to convert with, which is
        // also when the check itself reports that it can't be computed.
        private static string FormatPortionAmount(decimal amountPer100, decimal portionSize, string unit, string foodType)
        {
            if (amountPer100 <= 0) return "ikke oppgitt";
            if (portionSize <= 0) return FormatPerHundredAmount(amountPer100, unit, foodType);
            return $"{FormatNo(Math.Round(amountPer100 * portionSize / 100m, 3))} {unit} per porsjon";
        }

        // Everything in a result row that comes straight off the register entry, so the
        // callers below only have to decide the three things that are actually theirs: which
        // substance the row is about, how its amount reads, and whether it passed.
        private static HealthClaimResultDTO BuildEuClaimResult(
            string nutrient, string amountDisplay, string meetsRequirement,
            long policyItemId, EuHealthClaimEntry euClaim) => new()
            {
                Nutrient = NutrientLabel(nutrient),
                Amount = amountDisplay,
                MeetsRequirement = meetsRequirement,
                Naeringsmiddel = euClaim.NutrientSubstFood,
                Pastand = ClaimsShownInEnglish.Contains(policyItemId) ? euClaim.ClaimOriginal : euClaim.Claim,
                VilkaarForBruk = euClaim.ConditionOfUse,
                VilkaarOgBegrensninger = euClaim.RestrictionsOfUse,
                LegislationReference = euClaim.LegislationReference,
                SourceUrl = euClaim.LegislationUrl,
                EfsaQuestion = euClaim.EfsaQuestion,
                EfsaQuestionUrl = euClaim.EfsaQuestionUrl,
                EfsaQuestionTitle = EfsaOpinionTitles.GetValueOrDefault(policyItemId, euClaim.EfsaQuestion),
            };

        // Calcium and vitamin D. Each entered nutrient gets every "source of" claim in scope
        // for it, and when both are entered the one combined claim is added on top.
        private async Task<List<HealthClaimResultDTO>> BuildVitaminMineralClaimResults(
            List<HealthClaimInputDTO> inputs, string foodType, decimal portionSize)
        {
            var results = new List<HealthClaimResultDTO>();

            // Amounts converted into the unit each nutrient's thresholds are written in, kept
            // keyed by name so the combined claim below can read both back instead of walking
            // the input list a second time.
            var amounts = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

            foreach (var input in inputs)
            {
                // An unregistered name is skipped rather than guessed at. The picker only
                // offers registered ones, so anything else didn't come from the form.
                if (!VitaminMineralDefs.TryGetValue(input.Name, out var def)) continue;

                decimal amount = ConvertAmount(input.Amount, input.Unit, def.Unit);
                amounts[input.Name] = amount;

                // The source-of threshold is itself per 100 g / 100 ml, so the typed number is
                // already the one being compared. Nothing to restate but the basis.
                string amountDisplay = FormatPerHundredAmount(amount, def.Unit, foodType);
                string meetsReq = FormatSourceOfResult(amount, def, foodType);

                foreach (var id in SourceOfClaimIds.GetValueOrDefault(input.Name, Array.Empty<long>()))
                {
                    var euClaim = await _euHealthClaims.GetByIdAsync(id);
                    if (euClaim == null) continue;
                    results.Add(BuildEuClaimResult(input.Name, amountDisplay, meetsReq, id, euClaim));
                }

            }

            if (amounts.TryGetValue("Calcium", out decimal calciumMg) &&
                amounts.TryGetValue("Vitamin D", out decimal vitaminDUg))
            {
                var euClaim = await _euHealthClaims.GetByIdAsync(CalciumVitaminDPortionClaimId);
                if (euClaim != null)
                {
                    // Both nutrients in one line, without repeating their names: the card's
                    // title already says "Kalsium og vitamin D", and the order matches it.
                    // Restated per portion, since that's the basis the verdict was reached on.
                    string amountDisplay = portionSize > 0
                        ? $"{FormatNo(Math.Round(calciumMg * portionSize / 100m, 3))} mg + " +
                          $"{FormatNo(Math.Round(vitaminDUg * portionSize / 100m, 3))} µg per porsjon"
                        : $"{FormatNo(calciumMg)} mg + {FormatNo(vitaminDUg)} µg {PerHundredLabel(foodType)}";

                    results.Add(BuildEuClaimResult(
                        "Calcium and vitamin D",
                        amountDisplay,
                        FormatCalciumVitaminDPortionResult(calciumMg, vitaminDUg, portionSize),
                        CalciumVitaminDPortionClaimId,
                        euClaim));
                }
            }

            return results;
        }

        // The form sends the unit its own picker showed, which already matches the registry
        // for both nutrients in scope, so this only covers a request that says otherwise.
        private static decimal ConvertAmount(decimal amount, string fromUnit, string toUnit)
        {
            if (string.Equals(fromUnit, toUnit, StringComparison.OrdinalIgnoreCase)) return amount;
            if (fromUnit == "µg" && toUnit == "mg") return amount / 1000m;
            if (fromUnit == "mg" && toUnit == "µg") return amount * 1000m;
            return amount;
        }

        // "Food which is at least a source of X": 15 % of the nutrient reference value per
        // 100 g, or 7,5 % per 100 ml for beverages, which is what the "significant amount"
        // the SOURCE OF nutrition claim points at resolves to.
        private static string FormatSourceOfResult(decimal amountPer100, VitaminMineralDef def, string foodType)
        {
            decimal threshold = def.Nrv * (foodType == "liquid" ? 0.075m : 0.15m);
            string per = foodType == "liquid" ? "100 ml" : "100 g";
            return amountPer100 >= threshold
                ? MeetsRequirementText
                // A decimal keeps the scale of both operands of the multiplication above, so
                // 800 × 0,15 would otherwise render as "120,00", an accuracy the threshold
                // doesn't have.
                : $"Oppfyller ikke gitt krav (trenger minst {threshold.ToString("0.###", NorwegianCulture)} {def.Unit} per {per}, " +
                  $"produktet inneholder {FormatNo(amountPer100)} {def.Unit})";
        }

        // "At least 400 mg of calcium and 15 µg of vitamin D per daily portion" — both amounts
        // are per 100 g/ml, so both are scaled to the declared portion first, the same way
        // FormatPortionThresholdResult does it for the beta-glucan claims. Both nutrients have
        // to clear their own threshold, and a miss names whichever fell short.
        private static string FormatCalciumVitaminDPortionResult(
            decimal calciumMgPer100, decimal vitaminDUgPer100, decimal portionSize)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";

            decimal calciumInPortion = Math.Round(calciumMgPer100 * portionSize / 100m, 3);
            decimal vitaminDInPortion = Math.Round(vitaminDUgPer100 * portionSize / 100m, 3);

            var missing = new List<string>();
            if (calciumInPortion < CalciumVitaminDMinCalciumMg)
                missing.Add($"kalsium: trenger minst {FormatNo(CalciumVitaminDMinCalciumMg)} mg per porsjon, " +
                            $"porsjonen inneholder {FormatNo(calciumInPortion)} mg");
            if (vitaminDInPortion < CalciumVitaminDMinVitaminDUg)
                missing.Add($"vitamin D: trenger minst {FormatNo(CalciumVitaminDMinVitaminDUg)} µg per porsjon, " +
                            $"porsjonen inneholder {FormatNo(vitaminDInPortion)} µg");

            return missing.Count == 0
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav ({string.Join("; ", missing)})";
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

        private static string FormatHighFibreSourceResult(decimal sourceFibreGrams, string energyUnit, NutritionInputDTO n)
        {
            if (MeetsHighFibreThreshold(sourceFibreGrams, energyUnit, n)) return MeetsRequirementText;

            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
            {
                decimal per100kcal = Math.Round(sourceFibreGrams * 100m / n.EnergyKcal, 2);
                return $"Oppfyller ikke gitt krav (trenger minst 6 g per 100 g eller 3 g per 100 kcal, " +
                       $"produktet har {FormatNo(sourceFibreGrams)} g, tilsvarende {FormatNo(per100kcal)} g per 100 kcal)";
            }
            if (energyUnit == "energikj" && n.EnergyKj > 0)
            {
                decimal per100kj = Math.Round(sourceFibreGrams * 100m / n.EnergyKj, 2);
                return $"Oppfyller ikke gitt krav (trenger minst 6 g per 100 g eller 0,717 g per 100 kJ, " +
                       $"produktet har {FormatNo(sourceFibreGrams)} g, tilsvarende {FormatNo(per100kj)} g per 100 kJ)";
            }
            return $"Oppfyller ikke gitt krav (trenger minst 6 g per 100 g, produktet har {FormatNo(sourceFibreGrams)} g)";
        }

        // "At least X ... per quantified portion" — Mengde (per 100 g) must be scaled to the
        // declared portion before comparing against the fixed threshold. Comparing the raw
        // per-100g concentration directly would silently assume the portion is 100g.
        // The unit is a parameter because this covers both the beta-glucan claims, stated in
        // grams, and calcium's 837853, stated in milligrams.
        private static string FormatPortionThresholdResult(
            decimal amountPer100g, decimal portionSize, decimal minPerPortion, string unit)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";
            decimal amountInPortion = Math.Round(amountPer100g * portionSize / 100m, 3);
            return amountInPortion >= minPerPortion
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(minPerPortion)} {unit} per porsjon, " +
                  $"porsjonen inneholder {FormatNo(amountInPortion)} {unit})";
        }

        // "≥4g beta-glucan per 30g available carbohydrates in a quantified portion" — uses this
        // entry's own portion size, not a product-wide serving size.
        private static string FormatBetaGlucanMealRatioResult(decimal betaGlucanPer100g, decimal portionSize, decimal carbsPer100g)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";
            decimal carbsPerPortion = carbsPer100g * portionSize / 100m;
            if (carbsPerPortion <= 0) return $"{CannotComputePrefix} (ingen karbohydrater oppgitt)";
            decimal betaGlucanPerPortion = Math.Round(betaGlucanPer100g * portionSize / 100m, 3);
            decimal requiredBetaGlucan = Math.Round(carbsPerPortion * 4m / 30m, 3);
            return betaGlucanPerPortion / carbsPerPortion >= 4m / 30m
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(requiredBetaGlucan)} g beta-glukan per porsjon, porsjonen inneholder {FormatNo(betaGlucanPerPortion)} g)";
        }

        // "Resistant starch replacing digestible starch ... reduction in blood glucose rise" —
        // requires resistant starch to be at least 14% of the product's total starch.
        private async Task<HealthClaimResultDTO?> CheckResistantStarchHealthClaim(NutritionInputDTO n)
        {
            if (n.TotalStarch <= 0) return null;

            var claim = await _euHealthClaims.GetByIdAsync(ResistantStarchClaimId);
            if (claim == null) return null;

            decimal pct = n.ResistantStarch / n.TotalStarch * 100m;

            string meetsReq = pct >= 14m
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst 14 % resistent stivelse av total stivelse, produktet har {FormatNo(Math.Round(pct, 1))} %)";

            return new HealthClaimResultDTO
            {
                Nutrient = "Stivelse",
                Amount = $"{FormatNo(n.ResistantStarch)} g resistent stivelse av {FormatNo(n.TotalStarch)} g total stivelse",
                MeetsRequirement = meetsReq,
                Naeringsmiddel = claim.NutrientSubstFood,
                Pastand = claim.Claim,
                VilkaarForBruk = claim.ConditionOfUse,
                VilkaarOgBegrensninger = claim.RestrictionsOfUse,
                LegislationReference = claim.LegislationReference,
                SourceUrl = claim.LegislationUrl,
                EfsaQuestion = claim.EfsaQuestion,
                EfsaQuestionUrl = claim.EfsaQuestionUrl,
                EfsaQuestionTitle = EfsaOpinionTitles.GetValueOrDefault(ResistantStarchClaimId, claim.EfsaQuestion),
            };
        }
    }
}
