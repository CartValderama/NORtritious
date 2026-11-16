﻿using Backend.DTO;

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
        // and its effect on the ones that are implemented was to withhold them: group 1 never
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
        //
        // Twenty-two of the thirty claims in the Annex. The other eight are not here
        // because the calculator cannot reach a verdict on them, not because they were
        // curated out: four need a reference product to compare against, three state no
        // figure of their own and defer it elsewhere (the vitamin/mineral pair and
        // CONTAINS), and one is about how the composition came about rather than what it is
        // (NATURALLY/NATURAL).
        //
        // Five of the twenty-two were added by Regulation (EU) No 116/2010 and read figures
        // a label is not obliged to carry, so they are withheld rather than failed when
        // those figures are blank. See AddUnsaturatedFatClaim.
        //
        // Two of the seventeen, "Uten tilsatt sukker" and "Uten tilsatt natrium/salt", are
        // not calculated at all. Their condition is about the recipe, which no nutrition
        // table records, so the producer declares it and the result says so. See
        // ProductDeclarations.
        private static readonly HashSet<string> OfferedEfsaClaims = new()
        {
            // energi
            "lowEnergy",
            "energyFree",
            // fett
            "lowFat",
            "fatFree",
            // mettet fett
            "lowSaturatedFat",
            "saturatedFatFree",
            // umettet fett
            "highMonounsaturatedFat",
            "highPolyunsaturatedFat",
            "highUnsaturatedFat",
            // omega-3
            "sourceOfOmega3",
            "highOmega3",
            // sukkerarter
            "lowSugars",
            "sugarsFree",
            "withNoAddedSugars",
            // salt
            "lowSodium",
            "veryLowSodium",
            "sodiumFree",
            "noAddedSodium",
            // kostfiber
            "highFibre",
            "sourceOfFibre",
            // protein
            "sourceOfProtein",
            "highProtein",
        };

        private static bool Offers(string category, string claimKey) =>
            OfferedEfsaClaims.Contains(claimKey);

        // The order BuildEfsaNutritionClaimResults produces them in, so the schema can list
        // them the same way instead of in whatever order the set happens to enumerate.
        //
        // Grouped by nutrient, in the Annex's own sequence, so a reader comparing the result
        // against the regulation reads both in the same order. Within a group the stricter
        // claim follows the looser one, which is also how they fall out: a product that is
        // "fettfri" is necessarily "lavt fettinnhold" too.
        private static readonly string[] EfsaClaimOrder =
        {
            // energi
            "lowEnergy",
            "energyFree",
            // fett
            "lowFat",
            "fatFree",
            // mettet fett
            "lowSaturatedFat",
            "saturatedFatFree",
            // umettet fett
            "highMonounsaturatedFat",
            "highPolyunsaturatedFat",
            "highUnsaturatedFat",
            // omega-3
            "sourceOfOmega3",
            "highOmega3",
            // sukkerarter
            "lowSugars",
            "sugarsFree",
            "withNoAddedSugars",
            // salt
            "lowSodium",
            "veryLowSodium",
            "sodiumFree",
            "noAddedSodium",
            // kostfiber
            "highFibre",
            "sourceOfFibre",
            // protein
            "sourceOfProtein",
            "highProtein",
        };

        // ── EFSA Nutrition Claims ────────────────────────────────────────────────

        // The Norwegian sentence shown with each claim, one for met and one for not met.
        // Ported from CLAIMS_CONFIG in the frontend, which restated these limits in prose
        // beside a second copy of them in code.
        private record ClaimCopy(string MetText, string NotMetText);

        // Said the same way in every sweetener text, so the attribution cannot drift between
        // the two claims or between the screen and the PDF.
        private const string SweetenerPortionNote =
            "Porsjonen er den mengden du har oppgitt som tilsvarende 6 g sukrose, omtrent "
            + "én teskje. Kalkulatoren kontrollerer ikke søtningsevne.";

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
            // The sweetener texts, for both energy claims. Keyed off the claim's own key
            // with a suffix, because they are the same claim read against a different limit:
            // the row still carries Key "lowEnergy" or "energyFree", so the schema and the
            // frontend see two claims, not six.
            //
            // Every one of them names the porsjon as something the user supplied. The Annex
            // defines that portion by its sweetening power, which is a sensory property no
            // nutrition table holds, so the calculator cannot check it and the sentence must
            // not read as though it had. The figure is the producer's declaration, exactly
            // like the fat and salt figures beside it.
            ["lowEnergy.sweetener"] = new(
                "Dette produktet inneholder høyst 4 kcal / 17 kJ per porsjon, grensen for "
                + "bordsøtningsmidler. " + SweetenerPortionNote,
                "For bordsøtningsmidler er grensen høyst 4 kcal / 17 kJ per porsjon. "
                + SweetenerPortionNote),
            ["lowEnergy.noPortion"] = new(
                "Dette produktet inneholder høyst 4 kcal / 17 kJ per porsjon, grensen for "
                + "bordsøtningsmidler.",
                "Oppgi porsjonsstørrelsen under «Flere opplysninger», altså mengden som "
                + "tilsvarer 6 g sukrose. For bordsøtningsmidler gjelder grensen høyst "
                + "4 kcal / 17 kJ per porsjon, ikke per 100 g, og den kan ikke regnes ut "
                + "uten en porsjon."),
            ["energyFree.sweetener"] = new(
                "Dette produktet inneholder høyst 0,4 kcal / 1,7 kJ per porsjon, grensen for "
                + "bordsøtningsmidler. " + SweetenerPortionNote,
                "For bordsøtningsmidler er grensen høyst 0,4 kcal / 1,7 kJ per porsjon. "
                + SweetenerPortionNote),
            ["energyFree.noPortion"] = new(
                "Dette produktet inneholder høyst 0,4 kcal / 1,7 kJ per porsjon, grensen for "
                + "bordsøtningsmidler.",
                "Oppgi porsjonsstørrelsen under «Flere opplysninger», altså mengden som "
                + "tilsvarer 6 g sukrose. For bordsøtningsmidler gjelder grensen høyst "
                + "0,4 kcal / 1,7 kJ per porsjon, ikke per 100 g, og den kan ikke regnes ut "
                + "uten en porsjon."),
            ["lowFat"] = new(
                "Dette produktet inneholder høyst 3 g fett per 100 g for næringsmidler i fast form, "
                + "eller høyst 1,5 g fett per 100 ml for næringsmidler i flytende form.",
                "For faste næringsmidler må fettinnholdet være høyst 3 g per 100 g. "
                + "For flytende næringsmidler må fettinnholdet være høyst 1,5 g per 100 ml."),
            // Semi-skimmed milk is the Annex's one named product inside LOW FAT, and it
            // replaces the liquid limit rather than sitting beside it.
            ["lowFat.semiSkimmedMilk"] = new(
                "Dette produktet inneholder høyst 1,8 g fett per 100 ml, grensen for lettmelk.",
                "For lettmelk må fettinnholdet være høyst 1,8 g per 100 ml."),
            ["fatFree"] = new(
                "Dette produktet inneholder høyst 0,5 g fett per 100 g eller 100 ml.",
                "Kravet er høyst 0,5 g fett per 100 g eller 100 ml."),
            // Both halves of the claim, because a product can clear the grams and still be
            // refused on the 10 % share. See ClaimLowSaturatedFat.
            ["lowSaturatedFat"] = new(
                "Summen av mettede fettsyrer og transfettsyrer er høyst 1,5 g per 100 g for "
                + "næringsmidler i fast form, eller høyst 0,75 g per 100 ml for næringsmidler i "
                + "flytende form, og den utgjør høyst 10 % av energien.",
                "Summen av mettede fettsyrer og transfettsyrer må være høyst 1,5 g per 100 g "
                + "(fast form) eller høyst 0,75 g per 100 ml (flytende form), og den må samtidig "
                + "utgjøre høyst 10 % av energien. Begge vilkårene må være oppfylt."),
            ["saturatedFatFree"] = new(
                "Summen av mettede fettsyrer og transfettsyrer er høyst 0,1 g per 100 g eller 100 ml.",
                "Kravet er at summen av mettede fettsyrer og transfettsyrer er høyst 0,1 g per "
                + "100 g eller 100 ml."),
            // Each of the three unsaturated-fat claims carries two conditions joined by
            // "and", so both texts state both. A product can clear the share of the fatty
            // acids and still fail because the class contributes too little of the energy,
            // and a text naming only one of them would read as a contradiction of the
            // verdict beside it.
            ["highMonounsaturatedFat"] = new(
                "Minst 45 % av fettsyrene i produktet er enumettede, og enumettet fett står for "
                + "mer enn 20 % av energien.",
                "Kravet er at minst 45 % av fettsyrene i produktet er enumettede, og at "
                + "enumettet fett står for mer enn 20 % av energien. Begge vilkårene må være "
                + "oppfylt."),
            ["highPolyunsaturatedFat"] = new(
                "Minst 45 % av fettsyrene i produktet er flerumettede, og flerumettet fett "
                + "står for mer enn 20 % av energien.",
                "Kravet er at minst 45 % av fettsyrene i produktet er flerumettede, og at "
                + "flerumettet fett står for mer enn 20 % av energien. Begge vilkårene må "
                + "være oppfylt."),
            ["highUnsaturatedFat"] = new(
                "Minst 70 % av fettsyrene i produktet er umettede, og umettet fett står for "
                + "mer enn 20 % av energien.",
                "Kravet er at minst 70 % av fettsyrene i produktet er umettede, og at umettet "
                + "fett står for mer enn 20 % av energien. Begge vilkårene må være oppfylt."),
            // Two routes, either of which carries the claim on its own, and within a route
            // both bases have to be met. That is the opposite of the fibre claims, where the
            // two bases are alternatives, which is why the two cannot share a helper.
            ["sourceOfOmega3"] = new(
                "Produktet inneholder minst 0,3 g alfa-linolensyre per 100 g og per 100 kcal, "
                + "eller minst 0,04 g (40 mg) eikosapentaensyre og dokosaheksaensyre til "
                + "sammen per 100 g og per 100 kcal.",
                "Kravet er minst 0,3 g alfa-linolensyre per 100 g og per 100 kcal, eller minst "
                + "0,04 g (40 mg) eikosapentaensyre og dokosaheksaensyre til sammen per "
                + "100 g og per 100 kcal. For den veien du bruker må begge grunnlagene være "
                + "oppfylt."),
            ["highOmega3"] = new(
                "Produktet inneholder minst 0,6 g alfa-linolensyre per 100 g og per 100 kcal, "
                + "eller minst 0,08 g (80 mg) eikosapentaensyre og dokosaheksaensyre til "
                + "sammen per 100 g og per 100 kcal.",
                "Kravet er minst 0,6 g alfa-linolensyre per 100 g og per 100 kcal, eller minst "
                + "0,08 g (80 mg) eikosapentaensyre og dokosaheksaensyre til sammen per "
                + "100 g og per 100 kcal. For den veien du bruker må begge grunnlagene være "
                + "oppfylt."),
            ["lowSugars"] = new(
                "Dette produktet inneholder høyst 5 g sukkerarter per 100 g (fast form) eller høyst 2,5 g "
                + "per 100 ml (flytende form).",
                "For faste næringsmidler må sukkerinnholdet være høyst 5 g per 100 g. "
                + "For flytende næringsmidler må sukkerinnholdet være høyst 2,5 g per 100 ml."),
            ["sugarsFree"] = new(
                "Dette produktet inneholder høyst 0,5 g sukkerarter per 100 g eller 100 ml.",
                "Kravet er høyst 0,5 g sukkerarter per 100 g eller 100 ml."),
            // The only two claims here whose text describes a declaration rather than a
            // measurement, so both say whose verdict it is. The examples in the not-met text
            // are named because that is exactly where the mistake gets made: juice
            // concentrate and honey are sugar added, whatever the recipe calls them.
            ["withNoAddedSugars"] = new(
                "Du har bekreftet at produktet ikke inneholder tilsatte mono- eller disakkarider "
                + "eller andre næringsmidler brukt for sine søtende egenskaper. Kalkulatoren "
                + "kontrollerer ikke dette, siden det følger av oppskriften og ikke av "
                + "næringsinnholdet.",
                "Påstanden krever at du bekrefter at produktet ikke inneholder tilsatte mono- "
                + "eller disakkarider eller andre næringsmidler brukt for sine søtende "
                + "egenskaper, for eksempel konsentrert fruktjuice, honning, sirup eller "
                + "maltekstrakt."),
            // The Annex's own follow-up, and the reason sugar on the Sukkerarter row is no
            // obstacle to this claim: juice and milk are full of sugar nobody added. Used
            // only when there is sugar to describe, so a product at 0 g isn't told to print a
            // line about sugars it doesn't have.
            ["withNoAddedSugars.naturalSugars"] = new(
                "Du har bekreftet at produktet ikke inneholder tilsatte mono- eller disakkarider "
                + "eller andre næringsmidler brukt for sine søtende egenskaper. Kalkulatoren "
                + "kontrollerer ikke dette, siden det følger av oppskriften og ikke av "
                + "næringsinnholdet. Produktet inneholder sukker som forekommer naturlig, og "
                + "etiketten må da i tillegg bære påskriften «INNEHOLDER NATURLIG FOREKOMMENDE "
                + "SUKKER».",
                "Påstanden krever at du bekrefter at produktet ikke inneholder tilsatte mono- "
                + "eller disakkarider eller andre næringsmidler brukt for sine søtende "
                + "egenskaper, for eksempel konsentrert fruktjuice, honning, sirup eller "
                + "maltekstrakt."),
            // The Annex states each salt claim as a sodium figure "or the equivalent value for
            // salt". The salt figure is the one quoted here, since that is the field the form
            // collects, with the sodium figure named after it so the sentence can be checked
            // against the regulation without doing the conversion by hand.
            ["lowSodium"] = new(
                "Dette produktet inneholder høyst 0,3 g salt per 100 g eller 100 ml, som tilsvarer "
                + "0,12 g natrium.",
                "Kravet er høyst 0,3 g salt per 100 g eller 100 ml, som tilsvarer 0,12 g natrium."),
            // Waters are held sixty times stricter than everything else: 2 mg natrium per
            // 100 ml rather than 0,12 g. Natural mineral waters under Directive 80/777/EEC
            // are exempt from the stricter figure, which the calculator cannot tell apart
            // from other bottled water, so the sentence says which rule was applied.
            ["lowSodium.drinkingWater"] = new(
                "Dette produktet inneholder høyst 0,005 g salt per 100 ml, som tilsvarer "
                + "2 mg natrium. Dette er grensen for drikkevann, ikke for naturlig mineralvann.",
                "For drikkevann er grensen høyst 0,005 g salt per 100 ml, som tilsvarer "
                + "2 mg natrium. Naturlig mineralvann er unntatt fra denne strengere grensen."),
            ["veryLowSodium"] = new(
                "Dette produktet inneholder høyst 0,1 g salt per 100 g eller 100 ml, som tilsvarer "
                + "0,04 g natrium.",
                "Kravet er høyst 0,1 g salt per 100 g eller 100 ml, som tilsvarer 0,04 g natrium."),
            ["sodiumFree"] = new(
                "Dette produktet inneholder høyst 0,0125 g salt per 100 g, som tilsvarer 0,005 g "
                + "natrium.",
                "Kravet er høyst 0,0125 g salt per 100 g, som tilsvarer 0,005 g natrium."),
            // Two conditions joined by "and", and both texts name both of them, so a user who
            // ticked the box and still failed can see which half stopped it without having to
            // read the Annex.
            ["noAddedSodium"] = new(
                "Du har bekreftet at det ikke er tilsatt natrium eller salt, og at produktet "
                + "ikke inneholder andre ingredienser med tilsatt natrium eller salt. Produktet "
                + "inneholder i tillegg høyst 0,3 g salt per 100 g eller 100 ml, som tilsvarer "
                + "0,12 g natrium.",
                "Påstanden krever både at du bekrefter at det ikke er tilsatt natrium eller "
                + "salt, og at produktet inneholder høyst 0,3 g salt per 100 g eller 100 ml, som "
                + "tilsvarer 0,12 g natrium."),
            ["highFibre"] = new(
                "Dette produktet inneholder minst 6 g fiber per 100 g eller minst 3 g fiber per 100 kcal.",
                "Kravet er minst 6 g fiber per 100 g, eller minst 3 g fiber per 100 kcal."),
            ["sourceOfFibre"] = new(
                "Dette produktet inneholder minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.",
                "Kravet er minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal."),
            // A share of the energy, not an amount per 100 g: 5 g protein qualifies in a
            // low-energy product and does not in a dense one.
            ["sourceOfProtein"] = new(
                "Minst 12 % av produktets energiinnhold kommer fra protein.",
                "Kravet er at minst 12 % av energiinnholdet kommer fra protein."),
            ["highProtein"] = new(
                "Minst 20 % av produktets energiinnhold kommer fra protein.",
                "Kravet er at minst 20 % av energiinnholdet kommer fra protein."),
        };

        // Which text a row carries when a product type rewrites its condition. The suffix
        // is the product type itself, so a new carve-out needs a copy entry and nothing else.
        // Falls back to the claim's own key, which is the ordinary case and every claim no
        // product type touches.
        private static string ClaimCopyKeyFor(string claimKey, ProductBasis product) =>
            EfsaClaimCopy.ContainsKey($"{claimKey}.{product.ProductType}")
                ? $"{claimKey}.{product.ProductType}"
                : claimKey;

        private static string ExplanationFor(string claimKey, bool met) =>
            EfsaClaimCopy.TryGetValue(claimKey, out var copy)
                ? (met ? copy.MetText : copy.NotMetText)
                : string.Empty;

        // Every claim offered for this category and food type, met or not, with the figures
        // the verdict was reached on. Met comes from the same Claim* predicate the calculator
        // has always used, so the numbers reported here describe that verdict rather than
        // recomputing it, and a threshold can't be changed in one place and not the other.
        //
        // Twenty-two claims are in active use: energy, fat, saturated fat, the three
        // unsaturated-fat shares, the two omega-3 claims, sugar, salt, fibre (plain
        // High/Source only, no increased/reduced variants) and protein, plus the two the
        // producer declares rather than the calculator computes. The rest of the Claim*
        // predicates below are kept but not called from anywhere, for when scope expands
        // again.
        //
        // Every one of them is offered for every matkategori; only its own threshold decides
        // whether it is met. See OfferedEfsaClaims for why the per-category curation went.
        private static List<EfsaNutritionClaimDTO> BuildEfsaNutritionClaimResults(
            string category, string foodType, string energyUnit, NutritionInputDTO n,
            ProductBasis product, ProductDeclarations declarations)
        {
            bool liquid = foodType == "liquid";
            bool useKj = energyUnit == "energikj";
            decimal energy = useKj ? n.EnergyKj : n.EnergyKcal;
            string energyUnitLabel = useKj ? "kJ" : "kcal";
            string per100 = liquid ? "100 ml" : "100 g";
            decimal sugars = n.NaturalSugars + n.AddedSugars;

            var results = new List<EfsaNutritionClaimDTO>();

            // copyKey is the claim's own key for most rows, and a suffixed one where a
            // product type changes the sentence as well as the number. Key on the row stays
            // the claim's, so the schema and the frontend see one claim either way.
            // actual is nullable because one of these claims has no figure at all: its
            // condition is about the recipe, and there is no number to put beside a verdict
            // that was never reached from one. Comparator and thresholdUnit go empty with it,
            // which is what the screen and the PDF read to know not to print a limit.
            void Add(string key, string copyKey, string name, bool met,
                     decimal? actual, string actualUnit,
                     string comparator, decimal threshold, string thresholdUnit)
            {
                if (!Offers(category, key)) return;
                results.Add(new EfsaNutritionClaimDTO
                {
                    Key = key, Label = name, Passed = met,
                    ActualValue = actual, ActualUnit = actualUnit,
                    Comparator = comparator, ThresholdValue = threshold, ThresholdUnit = thresholdUnit,
                    Explanation = ExplanationFor(copyKey, met),
                });
            }

            // Both energy claims carry a separate per-portion limit for bordsøtningsmidler,
            // so both are built rather than added: the basis itself changes, not just the
            // number. They are the only two claims in the Annex that do this.
            AddEnergyClaim(results, category, "lowEnergy", "Lavt Energiinnhold",
                ClaimLowEnergy(n, foodType, energyUnit, product), product,
                energy, energyUnitLabel, per100,
                useKj ? (liquid ? 80m : 170m) : (liquid ? 20m : 40m),
                useKj ? SweetenerLowEnergyKj : SweetenerLowEnergyKcal);

            AddEnergyClaim(results, category, "energyFree", "Energifri",
                ClaimEnergyFree(energyUnit, n, product), product,
                energy, energyUnitLabel, per100,
                useKj ? 17m : 4m,
                useKj ? SweetenerEnergyFreeKj : SweetenerEnergyFreeKcal);

            // The Annex's one named product inside LOW FAT: "(1,8 g of fat per 100 ml for
            // semi-skimmed milk)". It replaces the liquid limit, it does not sit beside it.
            Add("lowFat", ClaimCopyKeyFor("lowFat", product), "Lavt fettinnhold",
                ClaimLowFat(foodType, n.Fat, product), n.Fat, "g", "≤",
                product.IsSemiSkimmedMilk ? SemiSkimmedMilkLowFat
                    : foodType == "solid" ? 3m : 1.5m,
                $"g/{per100}");

            Add("fatFree", "fatFree", "Fettfri", ClaimFatFree(n.Fat),
                n.Fat, "g", "≤", 0.5m, "g/100 g eller 100 ml");

            // Two conditions rather than one, so which figure to report depends on which of
            // them decided it. See AddLowSaturatedFatClaim.
            AddLowSaturatedFatClaim(results, category,
                ClaimLowSaturatedFat(foodType, energyUnit, n), foodType, energyUnit, n, per100);

            // On the sum of saturated and trans fat, not on saturated fat alone, which is why
            // the figure reported is that sum and not n.SaturatedFat.
            Add("saturatedFatFree", "saturatedFatFree", "Fri for mettet fett",
                ClaimSaturatedFatFree(n.SaturatedFat, n.TransFat),
                n.SaturatedFat + n.TransFat, "g", "≤", 0.1m, "g/100 g eller 100 ml");

            // Withheld rather than failed when the figures they read were not declared.
            // Enumettede, flerumettede and the two omega-3 figures are voluntary on a
            // nutrition label, so a blank is the ordinary case and not an omission; a row
            // reading "ikke oppfylt" would be the calculator answering a question it was
            // never given the numbers for. The drikkevann VERY LOW SODIUM row above is
            // withheld for the mirror reason: there the product cannot qualify, here it may
            // well qualify and we cannot tell.
            AddUnsaturatedFatClaim(results, category, "highMonounsaturatedFat",
                "Høyt innhold av enumettet fett",
                ClaimHighMonounsaturatedFat(energyUnit, n),
                n.MonounsaturatedFat, HighMonoPolyFattyAcidShare, energyUnit, n);

            AddUnsaturatedFatClaim(results, category, "highPolyunsaturatedFat",
                "Høyt innhold av flerumettet fett",
                ClaimHighPolyunsaturatedFat(energyUnit, n),
                n.PolyunsaturatedFat, HighMonoPolyFattyAcidShare, energyUnit, n);

            AddUnsaturatedFatClaim(results, category, "highUnsaturatedFat",
                "Høyt innhold av umettet fett",
                ClaimHighUnsaturatedFat(energyUnit, n),
                n.MonounsaturatedFat + n.PolyunsaturatedFat,
                HighUnsaturatedFattyAcidShare, energyUnit, n);

            AddOmega3Claim(results, category, "sourceOfOmega3", "Kilde til omega-3-fettsyrer",
                ClaimSourceOfOmega3(energyUnit, n),
                SourceOfOmega3Ala, SourceOfOmega3EpaDha, energyUnit, n, per100);

            AddOmega3Claim(results, category, "highOmega3", "Høyt innhold av omega-3-fettsyrer",
                ClaimHighOmega3(energyUnit, n),
                HighOmega3Ala, HighOmega3EpaDha, energyUnit, n, per100);

            Add("lowSugars", "lowSugars", "Lavt sukkerinnhold", ClaimLowSugars(foodType, n.NaturalSugars, n.AddedSugars),
                sugars, "g", "≤", liquid ? 2.5m : 5m, $"g/{per100}");

            Add("sugarsFree", "sugarsFree", "Sukkerfri", ClaimSugarsFree(n.NaturalSugars, n.AddedSugars),
                sugars, "g", "≤", 0.5m, "g/100 g eller 100 ml");

            // No figure, no comparator and no threshold: the Annex states none for this
            // claim, and the one number it could borrow is Sukkerarter, which is the total
            // rather than the added part. Printing it beside this verdict would quote a
            // figure the verdict was not reached on, and would read as an argument against
            // itself on every juice and every glass of milk.
            //
            // Which copy applies turns on whether there is any sugar at all, because the
            // Annex attaches a second label obligation when there is. Same suffix mechanism
            // the product types use.
            Add("withNoAddedSugars",
                sugars > 0 ? "withNoAddedSugars.naturalSugars" : "withNoAddedSugars",
                "Uten tilsatt sukker", ClaimWithNoAddedSugars(declarations),
                null, "", "", 0m, "");

            // Thresholds written as the sodium figure times SaltPerSodium rather than as the
            // salt figure directly, so each one reads as the Annex states it and matches the
            // predicate it is reporting on.
            Add("lowSodium", ClaimCopyKeyFor("lowSodium", product), "Lavt saltinnhold",
                ClaimLowSodium(n.Salt, product), n.Salt, "g", "≤",
                (product.IsWater ? WaterLowSodium : 0.12m) * SaltPerSodium,
                product.IsWater ? "g/100 ml" : "g/100 g eller 100 ml");

            // Withheld rather than failed for a drikkevann. "This claim shall not be used for
            // natural mineral waters and other waters" is a prohibition, not a threshold: a
            // row saying "ikke oppfylt" would suggest the product could qualify by changing
            // its recipe, and it cannot qualify at all.
            if (!product.IsWater)
            {
                Add("veryLowSodium", "veryLowSodium", "Svært lavt saltinnhold",
                    ClaimVeryLowSodium(n.Salt),
                    n.Salt, "g", "≤", 0.04m * SaltPerSodium, "g/100 g eller 100 ml");
            }

            Add("sodiumFree", "sodiumFree", "Saltfri", ClaimSodiumFree(n.Salt),
                n.Salt, "g", "≤", 0.005m * SaltPerSodium, "g/100 g");

            // Half declared and half measured, so which half refused it decides what the
            // row may report. With the box ticked the salt ceiling is the live condition and
            // the Salt figure is what the verdict turned on, threshold written the way LOW
            // SODIUM writes it. With the box unticked that ceiling was never reached for, so
            // no figure, comparator or threshold is printed at all.
            //
            // Printing it anyway put "0,05 g ≤ 0,3 g" beside "ikke oppfylt" on a product
            // whose salt was never the problem, and that is the state every product starts
            // in: the reader was shown a figure arguing against the verdict next to it, with
            // nothing on the row to say the missing declaration was the reason. Same blanking
            // withNoAddedSugars above uses, for the same reason.
            bool saltDeclared = declarations.NoAddedSalt;
            Add("noAddedSodium", "noAddedSodium", "Uten tilsatt natrium/salt",
                ClaimNoAddedSodium(n.Salt, declarations),
                saltDeclared ? n.Salt : null, saltDeclared ? "g" : "",
                saltDeclared ? "≤" : "",
                saltDeclared ? 0.12m * SaltPerSodium : 0m,
                saltDeclared ? "g/100 g eller 100 ml" : "");

            // Both fibre claims have an alternative per-100-kcal basis. Reporting only the
            // per-100 g figure made a claim that passed on the energy basis look like it had
            // failed its own threshold, so whichever basis actually carried it is the one
            // reported.
            AddFibreClaim(results, category, "highFibre", "Høyt Fiberinnhold",
                ClaimHighFibre(foodType, energyUnit, n), 6m, 3m, energyUnit, n, per100);
            AddFibreClaim(results, category, "sourceOfFibre", "Kostfiberkilde",
                ClaimSourceOfFibre(energyUnit, n), 3m, 1.5m, energyUnit, n, per100);

            // Both protein claims are a share of the energy, so the share is what gets
            // reported: a bare "5 g protein vs 12" would quote a threshold the Annex never
            // sets. Protein carries 4 kcal/g and 17 kJ/g (Annex XIV to Regulation (EU)
            // No 1169/2011).
            AddEnergyShareClaim(results, category, "sourceOfProtein", "Proteinkilde",
                ClaimSourceOfProtein(energyUnit, n), n.Protein, 4m, 17m,
                "≥", SourceOfProteinEnergyShare, "% av energien fra protein", energyUnit, n);

            AddEnergyShareClaim(results, category, "highProtein", "Høyt proteininnhold",
                ClaimHighProtein(energyUnit, n), n.Protein, 4m, 17m,
                "≥", 20m, "% av energien fra protein", energyUnit, n);

            return results;
        }

        // The fibre claims qualify on either "at least X g per 100 g" or "at least Y g per
        // 100 kcal". The per-100 g figure is the primary one, so it's reported unless the
        // product only cleared the energy-based alternative.
        private static void AddFibreClaim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, decimal perHundredGrams, decimal perHundredKcal,
            string energyUnit, NutritionInputDTO n, string per100)
        {
            if (!Offers(category, key)) return;

            bool clearsPerHundredGrams = n.Fibre >= perHundredGrams;
            bool useEnergyBasis = met && !clearsPerHundredGrams;

            decimal kcal = EnergyAsKcal(energyUnit, n);

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met, Comparator = "≥", ActualUnit = "g",
                Explanation = ExplanationFor(key, met),
                ActualValue = useEnergyBasis && kcal > 0
                    ? RoundAwayFromThreshold(n.Fibre * 100m / kcal, "≥", 2)
                    : n.Fibre,
                ThresholdValue = useEnergyBasis ? perHundredKcal : perHundredGrams,
                // Per 100 kcal even for a product declared in kJ, because that is the only
                // energy basis the Annex gives this claim and so the one the verdict was
                // reached against. The figure beside it is converted to match.
                ThresholdUnit = useEnergyBasis ? "g/100 kcal" : $"g/{per100}",
            });
        }

        // LOW SATURATED FAT is the only offered claim with two conditions, and either can be
        // the one that refuses it. Reporting the grams unconditionally meant a product with
        // 1 g of saturated fat in 60 kcal was shown as "1 g ≤ 1,5 g" and marked not met,
        // which reads as the calculator contradicting itself: the figure that actually refused
        // it was the 15 % of energy. So the energy share is reported in exactly that case,
        // where the grams cleared and the share did not.
        private static void AddLowSaturatedFatClaim(
            List<EfsaNutritionClaimDTO> results, string category, bool met,
            string foodType, string energyUnit, NutritionInputDTO n, string per100)
        {
            const string key = "lowSaturatedFat";
            const string name = "Lavt innhold av mettet fett";
            if (!Offers(category, key)) return;

            decimal satPlusTrans = n.SaturatedFat + n.TransFat;
            decimal gramLimit = foodType == "solid" ? 1.5m : 0.75m;

            if (!met && satPlusTrans <= gramLimit)
            {
                // Fat carries 9 kcal/g and 37 kJ/g (Annex XIV to Regulation (EU) No 1169/2011).
                AddEnergyShareClaim(results, category, key, name, met, satPlusTrans, 9m, 37m,
                    "≤", 10m, "% av energien fra mettet fett og transfett", energyUnit, n);
                return;
            }

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met,
                ActualValue = satPlusTrans, ActualUnit = "g", Comparator = "≤",
                ThresholdValue = gramLimit, ThresholdUnit = $"g/{per100}",
                Explanation = ExplanationFor(key, met),
            });
        }

        // The three unsaturated-fat claims share a shape: a share of the declared fatty
        // acids, and a share of the energy, both of which have to hold. Either can be the
        // one that refuses the claim, so the row reports whichever did, exactly the way
        // AddLowSaturatedFatClaim picks between its two conditions.
        //
        // Nothing is added at all when the breakdown was not declared. See
        // CalculatorRequestDTO.MonounsaturatedFat for why a blank is not a zero.
        private static void AddUnsaturatedFatClaim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, decimal? grams, decimal share, string energyUnit, NutritionInputDTO n)
        {
            if (!Offers(category, key)) return;
            if (grams is not decimal g) return;
            if (DeclaredFattyAcids(n) is not decimal total || total <= 0) return;

            bool useKcal = energyUnit == "energikcal";
            decimal energy = useKcal ? n.EnergyKcal : n.EnergyKj;
            decimal classEnergy = g * (useKcal ? KcalPerGramFat : KjPerGramFat);

            // The energy condition is what gets reported in exactly one case: the share of
            // fatty acids cleared and the claim still failed, which leaves nothing else to
            // have refused it.
            if (g * 100m / total >= share && !met)
            {
                results.Add(new EfsaNutritionClaimDTO
                {
                    Key = key, Label = name, Passed = met,
                    // Rounded as a minimum even though the comparator printed is ">": the
                    // Annex says "more than 20 %", and flooring keeps the figure on the
                    // failing side of the line the same way it does for "≥".
                    ActualValue = energy > 0
                        ? RoundAwayFromThreshold(classEnergy * 100m / energy, "≥", 2)
                        : 0m,
                    ActualUnit = "%", Comparator = ">",
                    ThresholdValue = HighFatEnergyShare,
                    ThresholdUnit = "% av energien",
                    Explanation = ExplanationFor(key, met),
                });
                return;
            }

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met,
                ActualValue = RoundAwayFromThreshold(g * 100m / total, "≥", 1),
                ActualUnit = "%", Comparator = "≥",
                ThresholdValue = share,
                ThresholdUnit = "% av fettsyrene",
                Explanation = ExplanationFor(key, met),
            });
        }

        // Either route carries an omega-3 claim on its own, and within a route both bases
        // have to be met. So the row names the route it describes, and where the claim
        // failed it names the basis that refused it: the per-100 g figure where that fell
        // short, the per-energy figure where the grams cleared and the energy basis did not.
        private static void AddOmega3Claim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, decimal alaLimit, decimal epaDhaLimit,
            string energyUnit, NutritionInputDTO n, string per100)
        {
            if (!Offers(category, key)) return;
            decimal? epaPlusDha = EpaPlusDha(n);
            if (n.AlphaLinolenicAcid is null && epaPlusDha is null) return;

            decimal kcal = EnergyAsKcal(energyUnit, n);

            bool alaMet = Omega3RouteMet(n.AlphaLinolenicAcid, alaLimit, kcal);
            bool epaMet = Omega3RouteMet(epaPlusDha, epaDhaLimit, kcal);

            // The route that carried it; where neither did, alfa-linolensyre if it was
            // declared at all, since the Annex names it first and it is the figure a label
            // is likelier to carry.
            bool showAla = alaMet || (!epaMet && n.AlphaLinolenicAcid is not null);

            decimal amount = (showAla ? n.AlphaLinolenicAcid : epaPlusDha)!.Value;
            const string unit = "g";
            decimal limit = showAla ? alaLimit : epaDhaLimit;

            // Named in the unit, because the row silently picks one of two routes and the
            // figure means nothing without knowing which. "8 g/100 ml" beside a claim about
            // omega-3 reads as 8 g of omega-3; "8 g alfa-linolensyre/100 ml" is what was
            // actually weighed.
            string substance = showAla
                ? "alfa-linolensyre"
                : "eikosapentaensyre og dokosaheksaensyre";

            // The energy basis is reported only where the per-100 g one cleared and the
            // claim still failed, which leaves the energy basis as what refused it. The
            // kcal > 0 term is load-bearing: with no energy entered neither basis has been
            // weighed, and without it the per-100 g figure was printed under a per-100-kcal
            // threshold, so the row quoted a figure in one unit against a limit in another.
            bool useEnergyBasis = kcal > 0 && amount >= limit && !(showAla ? alaMet : epaMet);

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met, Comparator = "≥", ActualUnit = unit,
                // Five decimals rather than the two the other claims use: the smallest
                // threshold here is 0,04 g, and rounding a passing figure to two would
                // floor it onto the threshold or below it and print a row that argued
                // against the verdict beside it.
                ActualValue = useEnergyBasis
                    ? RoundAwayFromThreshold(amount * 100m / kcal, "≥", 5)
                    : amount,
                // One figure for both bases, as the Annex writes it.
                ThresholdValue = limit,
                ThresholdUnit = useEnergyBasis
                    ? $"{unit} {substance}/100 kcal"
                    : $"{unit} {substance}/{per100}",
                Explanation = ExplanationFor(key, met),
            });
        }

        // A claim whose threshold is a percentage of the product's energy rather than an
        // amount per 100 g. The nutrient's grams are converted with its own energy factor and
        // reported as that percentage, so the row quotes the figure the predicate weighed.
        //
        // A product with no energy entered reports 0 %, which is what the predicates return
        // false on: the alternative, dividing by zero, is not a percentage at all.
        private static void AddEnergyShareClaim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, decimal grams, decimal kcalPerGram, decimal kjPerGram,
            string comparator, decimal thresholdPercent, string thresholdUnit,
            string energyUnit, NutritionInputDTO n)
        {
            if (!Offers(category, key)) return;

            bool useKcal = energyUnit == "energikcal";
            decimal energy = useKcal ? n.EnergyKcal : n.EnergyKj;
            decimal nutrientEnergy = grams * (useKcal ? kcalPerGram : kjPerGram);

            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met,
                ActualValue = energy > 0
                    ? RoundAwayFromThreshold(nutrientEnergy * 100m / energy, comparator, 1)
                    : 0m,
                ActualUnit = "%", Comparator = comparator,
                ThresholdValue = thresholdPercent, ThresholdUnit = thresholdUnit,
                Explanation = ExplanationFor(key, met),
            });
        }

        // 1 kcal = 4,184 kJ (Annex XIV to Regulation (EU) No 1169/2011).
        private const decimal KjPerKcal = 4.184m;

        // The product's energy in kcal, whichever unit it was declared in.
        //
        // Several claims in the Annex state a per-100-kcal basis and no per-100-kJ one at
        // all, so the product is converted into the Annex's unit rather than the Annex's
        // figure being converted into the product's. Converting the figure the other way
        // meant carrying six derived constants, and two of them had been rounded up:
        // 1,5 / 4,184 is 0,3585086 and the constant read 0,36, which is 0,43 % stricter
        // than the regulation. A product declaring exactly 1,5 g kostfiber per 100 kcal was
        // refused Kostfiberkilde for choosing kJ on the form, and the same product passed in
        // kcal. Alfa-linolensyre at 0,3 g per 100 kcal had the identical defect.
        //
        // Rounding those constants down instead would only move the error to the other
        // side of the line, where it grants claims. There is nothing left here to round.
        private static decimal EnergyAsKcal(string energyUnit, NutritionInputDTO n) =>
            energyUnit == "energikcal" ? n.EnergyKcal : n.EnergyKj / KjPerKcal;

        // Rounded away from the threshold rather than to nearest. A product with 11,97 % of
        // its energy from protein rounds to "12,0 %", which was then printed beside "≥ 12 %"
        // and a verdict of not met: the row contradicted itself, and the figure was the only
        // part of it the reader could check. Floor for a minimum and ceiling for a maximum
        // keep the printed figure on the same side of the line as the verdict it describes.
        //
        // It can only ever move the display, never the verdict: every Claim* predicate reads
        // the unrounded value.
        private static decimal RoundAwayFromThreshold(decimal value, string comparator, int decimals)
        {
            decimal factor = 1m;
            for (int i = 0; i < decimals; i++) factor *= 10m;
            return comparator == "≥"
                ? Math.Floor(value * factor) / factor
                : Math.Ceiling(value * factor) / factor;
        }


        // LOW ENERGY and ENERGY-FREE are each read against one of two limits. For most
        // products it is the Annex's per-100 figure. For a table-top sweetener the Annex
        // instead sets a per-portion one, "with equivalent sweetening properties to 6 g of
        // sucrose (approximately 1 teaspoon of sucrose)".
        //
        // A sweetener with no portion entered fails rather than falling back to the per-100
        // limit, and the row says a portion is what is missing. Falling back would be the
        // wrong kind of wrong: per 100 g is the looser test for something used by the
        // spoonful, so a product that cannot be shown to qualify would be told that it does.
        private static void AddEnergyClaim(
            List<EfsaNutritionClaimDTO> results, string category, string key, string name,
            bool met, ProductBasis product,
            decimal energy, string energyUnitLabel, string per100,
            decimal perHundredLimit, decimal perPortionLimit)
        {
            if (!Offers(category, key)) return;

            if (!product.IsTableTop)
            {
                results.Add(new EfsaNutritionClaimDTO
                {
                    Key = key, Label = name, Passed = met,
                    ActualValue = energy, ActualUnit = energyUnitLabel, Comparator = "≤",
                    ThresholdValue = perHundredLimit,
                    ThresholdUnit = $"{energyUnitLabel}/{per100}",
                    Explanation = ExplanationFor(key, met),
                });
                return;
            }

            // Reported per portion from here down, including when the claim fails, so the
            // figure in the row is the one the limit beside it is about.
            results.Add(new EfsaNutritionClaimDTO
            {
                Key = key, Label = name, Passed = met,
                ActualValue = product.PortionSize > 0
                    ? RoundAwayFromThreshold(
                        energy * product.PortionSize / 100m, "≤", 2)
                    : null,
                ActualUnit = energyUnitLabel, Comparator = "≤",
                ThresholdValue = perPortionLimit,
                ThresholdUnit = $"{energyUnitLabel}/porsjon",
                Explanation = ExplanationFor(
                    product.PortionSize <= 0 ? $"{key}.noPortion" : $"{key}.sweetener", met),
            });
        }

        // ── Claims that are implemented but not offered ──────────────────────────
        //
        // Everything from here down is a Claim* predicate. Twenty-two of them are called from
        // BuildEfsaNutritionClaimResults above; the rest are kept against the day scope
        // widens, and each would need a row in OfferedEfsaClaims, EfsaClaimOrder,
        // EfsaClaimCopy and EfsaClaimInputFields before it could be added there.
        //
        // None of the remaining ones is waiting on copy or on a row in a dictionary. Each is
        // waiting on an input the form does not collect, which is why none of them was
        // switched on with the others:
        //
        //   ClaimReduced             Redusert [næringsstoff]
        //   ClaimReducedFat          Redusert fettinnhold
        //   ClaimReducedSaturatedFat Redusert innhold av mettet fett
        //   ClaimReducedSalt         Redusert saltinnhold
        //   ClaimReducedFibre        Redusert kostfiberinnhold
        //   ClaimIncreasedFibre      Økt kostfiberinnhold
        //   ClaimLightLite           Lett/Lite
        //
        //     All seven compare against a similar product, and the form collects one product.
        //     Enabling them means adding a reference product to the form first, not changing
        //     anything here.
        //
        // Three more are not written at all, and deliberately so. SOURCE OF [vitamin/mineral],
        // HIGH [vitamin/mineral] and CONTAINS [næringsstoff] are the only claims in the Annex
        // that state no figure of their own: SOURCE OF defers to "a significant amount as
        // defined in the Annex to Directive 90/496/EEC", HIGH to twice whatever that resolves
        // to, and CONTAINS to "all the applicable provisions of this Regulation, and in
        // particular Article 5". Coding any of them means first choosing a reference-value
        // table and a reading of Article 5. That is an editorial judgement, not a calculation,
        // so it is left to whoever prepares the label rather than guessed at here.
        //
        // ClaimWithNoAddedSugars and ClaimNoAddedSodium were in this list until the form
        // started asking for the two declarations. Their condition is still about what went
        // into the product rather than what came out, so neither is a calculation and neither
        // ever will be; the difference is that the producer now answers it and the result
        // records the answer as theirs. See ProductDeclarations.

        // "For table-top sweeteners the limit of 4 kcal (17 kJ)/portion, with equivalent
        // sweetening properties to 6 g of sucrose (approximately 1 teaspoon of sucrose),
        // applies." The same sub-clause ENERGY-FREE carries, ten times looser. See
        // ClaimEnergyFree for why the portion is taken on the producer's word.
        private static bool ClaimLowEnergy(
            NutritionInputDTO n, string foodType, string energyUnit, ProductBasis product)
        {
            bool useKcal = energyUnit == "energikcal";

            if (product.IsTableTop)
            {
                if (!product.CanUsePerPortion) return false;
                decimal perPortion =
                    (useKcal ? n.EnergyKcal : n.EnergyKj) * product.PortionSize / 100m;
                return perPortion <= (useKcal ? SweetenerLowEnergyKcal : SweetenerLowEnergyKj);
            }

            bool liquid = foodType == "liquid";
            if (useKcal)
                return liquid ? n.EnergyKcal <= 20 : n.EnergyKcal <= 40;
            return liquid ? n.EnergyKj <= 80 : n.EnergyKj <= 170;
        }

        // The Annex to Regulation (EC) No 1924/2006 writes ENERGY-FREE as "no more than
        // 4 kcal (17 kJ)/100 ml", i.e. for liquids only, unlike LOW ENERGY which states a
        // figure for each food type. The same limit is applied to solids here by the product
        // owner's decision: the Annex gives no separate solid figure, and refusing the claim
        // to solids outright would be its own kind of wrong answer.
        //

        // The product-type carve-out in force, with the portion it may need. Grouped
        // because the two are only meaningful together: a portion with no sweetener type is
        // an ordinary portion size.
        private readonly record struct ProductBasis(string ProductType, decimal PortionSize)
        {
            public bool IsTableTop => ProductType == "tableTopSweetener";
            public bool IsWater => ProductType == "drinkingWater";
            public bool IsSemiSkimmedMilk => ProductType == "semiSkimmedMilk";

            // Withheld with the six chewing gum health claims it existed for, which no
            // matkategori could reach. Unlike the three above it changes no næringspåstand.
            // See NutritionGate.SugarsFreeChewingGum.
            // public bool IsChewingGum => ProductType == "chewingGum";

            public bool CanUsePerPortion => IsTableTop && PortionSize > 0;
        }

        // What the producer has asserted about the recipe. Two claims in the Annex turn on
        // what went into the product rather than on what came out of it, and a nutrition
        // table only ever describes what came out, so neither value can be derived from
        // anything else on the form. Separate from ProductBasis because that record says what
        // the product is for the purpose of a carve-out; this one says what its maker has
        // told us, which the calculator records rather than checks.
        //
        // See CalculatorRequestDTO.NoAddedSugarsDeclared for why a "tilsatt sukker" field
        // would not have replaced this.
        private readonly record struct ProductDeclarations(bool NoAddedSugars, bool NoAddedSalt);

        // "no more than 0,12 g of sodium ... per 100 g or per 100 ml. For waters, other than
        // natural mineral waters falling within the scope of Directive 80/777/EEC, this value
        // should not exceed 2 mg of sodium per 100 ml." 2 mg natrium = 0,005 g salt.
        private const decimal WaterLowSodium = 0.002m;

        // "(1,8 g of fat per 100 ml for semi-skimmed milk)", in place of the 1,5 g every
        // other liquid is held to.
        private const decimal SemiSkimmedMilkLowFat = 1.8m;

        // The two per-portion limits, and the reason they are named rather than written in
        // place: 4 kcal appears twice in the Annex meaning different things. It is LOW
        // ENERGY's per-portion limit for a sweetener, and it is also ENERGY-FREE's ordinary
        // per-100 ml limit. The two sweetener sentences are word for word identical apart
        // from a decimal point, so a bare 4m in the wrong branch would read as correct.
        //
        // (The 2006 text as adopted had 4 kcal in both sweetener sentences; the corrigendum
        // in OJ L 404, 30.12.2006 replaced the Annex. An uncorrected copy still reads 4.)
        private const decimal SweetenerLowEnergyKcal = 4m;
        private const decimal SweetenerLowEnergyKj = 17m;
        private const decimal SweetenerEnergyFreeKcal = 0.4m;
        private const decimal SweetenerEnergyFreeKj = 1.7m;

        // The sub-clause "For table-top sweeteners the limit of 0,4 kcal (1,7 kJ)/portion,
        // with equivalent sweetening properties to 6 g of sucrose (approximately 1 teaspoon
        // of sucrose), applies" is read here.
        //
        // The sweetening-power half is not computed, and cannot be: it is a sensory property,
        // established by a panel, and nothing in a nutrition table implies it. An intense
        // sweetener's sweetness comes from additives that never appear there at any value.
        // So the form asks for the portion that has it, by saying so in the field's own
        // label, and the claim text attributes the figure to the producer instead of
        // presenting it as something checked. That is how every other figure here is
        // treated; this one only feels different because the Annex writes it as a sentence
        // rather than as a row in the table.
        //
        // A sweetener with no portion fails rather than being judged against the 4 kcal
        // figure. That figure is not the one the Annex gives it, and here it is the looser of
        // the two, so a fallback would hand out the claim on a test the product never took.
        private static bool ClaimEnergyFree(
            string energyUnit, NutritionInputDTO n, ProductBasis product)
        {
            bool useKcal = energyUnit == "energikcal";
            decimal perHundred = useKcal ? n.EnergyKcal : n.EnergyKj;

            if (product.IsTableTop)
            {
                if (!product.CanUsePerPortion) return false;
                decimal perPortion = perHundred * product.PortionSize / 100m;
                return perPortion <= (useKcal ? SweetenerEnergyFreeKcal : SweetenerEnergyFreeKj);
            }

            return perHundred <= (useKcal ? 4m : 17m);
        }

        // "no more than 3 g of fat per 100 g for solids or 1,5 g of fat per 100 ml for
        // liquids (1,8 g of fat per 100 ml for semi-skimmed milk)".
        private static bool ClaimLowFat(string foodType, decimal fat, ProductBasis product)
        {
            if (product.IsSemiSkimmedMilk) return fat <= SemiSkimmedMilkLowFat;
            return foodType == "solid" ? fat <= 3 : fat <= 1.5m;
        }

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

        // The claims Regulation (EU) No 116/2010 added to the Annex.
        //
        // Two of the four numbers are stated per 100 kcal only, so a product declared in kJ
        // is held to the converted figure named here rather than to a division done where
        // the comparison happens: the constant the row prints has to be the constant the
        // predicate used, or the row quotes a threshold the verdict was not reached against.
        // 1 kcal = 4,184 kJ (Annex XIV to Regulation (EU) No 1169/2011), and the rounding
        // matches what the fibre claims already do with their own per-100-kJ figures.
        private const decimal SourceOfOmega3Ala = 0.3m;      // g, per 100 g and per 100 kcal
        private const decimal SourceOfOmega3EpaDha = 0.04m;  // 40 mg, on the same two bases
        private const decimal HighOmega3Ala = 0.6m;
        private const decimal HighOmega3EpaDha = 0.08m;      // 80 mg

        // "HIGH MONOUNSATURATED FAT ... may only be made where at least 45 % of the fatty
        // acids present in the product derive from monounsaturated fat under the condition
        // that monounsaturated fat provides more than 20 % of energy of the product", and
        // word for word the same for polyunsaturated. Unsaturated fat takes 70 % in place of
        // 45 % and keeps the same 20 %.
        //
        // The two phrasings are not the same test and are not written as if they were: the
        // share of fatty acids is "at least" and the share of energy is "more than", so one
        // is ≥ and the other is strictly >.
        // Written as percentages rather than fractions because they are reported as
        // percentages: 0,45m * 100m is 45,00m in decimal arithmetic, which keeps the scale
        // of both operands and would have printed "45,00 %" in the report.
        private const decimal HighMonoPolyFattyAcidShare = 45m;
        private const decimal HighUnsaturatedFattyAcidShare = 70m;
        private const decimal HighFatEnergyShare = 20m;

        // "the fatty acids present in the product", which is the sum of the four classes a
        // nutrition declaration separates and not the Fett figure. Total fat is a different
        // quantity: it includes the glycerol the fatty acids are bound to, and lipids that
        // are not fatty acids at all, so dividing by it would understate every share by
        // roughly a twentieth and refuse claims the Annex allows.
        //
        // Null unless both voluntary classes were declared. With one of them missing the
        // denominator is short by however much it held, which inflates the share and grants
        // the claim: the one direction this must never fail in. That is why all three fat
        // claims need both fields and not just the one they are named after.
        private static decimal? DeclaredFattyAcids(NutritionInputDTO n) =>
            n.MonounsaturatedFat is decimal mufa && n.PolyunsaturatedFat is decimal pufa
                ? n.SaturatedFat + n.TransFat + mufa + pufa
                : null;

        private static bool ClaimHighMonounsaturatedFat(string energyUnit, NutritionInputDTO n) =>
            ClaimHighFattyAcidClass(energyUnit, n, n.MonounsaturatedFat, HighMonoPolyFattyAcidShare);

        private static bool ClaimHighPolyunsaturatedFat(string energyUnit, NutritionInputDTO n) =>
            ClaimHighFattyAcidClass(energyUnit, n, n.PolyunsaturatedFat, HighMonoPolyFattyAcidShare);

        // Unsaturated is the two cis classes added together. Transfett is unsaturated as
        // chemistry but is declared and regulated as its own class, and reading it into a
        // claim whose point is the opposite would be a perverse reading of the Annex, so it
        // stays in the denominator and out of the numerator.
        private static bool ClaimHighUnsaturatedFat(string energyUnit, NutritionInputDTO n) =>
            ClaimHighFattyAcidClass(energyUnit, n,
                n.MonounsaturatedFat + n.PolyunsaturatedFat, HighUnsaturatedFattyAcidShare);

        private static bool ClaimHighFattyAcidClass(
            string energyUnit, NutritionInputDTO n, decimal? grams, decimal share)
        {
            if (grams is not decimal g) return false;
            if (DeclaredFattyAcids(n) is not decimal total || total <= 0) return false;

            bool useKcal = energyUnit == "energikcal";
            decimal energy = useKcal ? n.EnergyKcal : n.EnergyKj;
            if (energy <= 0) return false;

            decimal classEnergy = g * (useKcal ? KcalPerGramFat : KjPerGramFat);
            return g * 100m / total >= share
                && classEnergy * 100m / energy > HighFatEnergyShare;
        }

        // "at least 0,3 g alpha-linolenic acid per 100 g AND per 100 kcal, or at least 40 mg
        // of the sum of eicosapentaenoic acid and docosahexaenoic acid per 100 g AND per
        // 100 kcal." The "or" is between the two routes and the "and" is between the two
        // bases, so a dense product can carry 0,3 g per 100 g and still be refused for
        // falling short per 100 kcal.
        // "the sum of eicosapentaenoic acid and docosahexaenoic acid", from the two figures
        // a label declares separately.
        //
        // A blank one of the pair is read as nothing rather than withholding the sum, and
        // that is sound here in a way it is not elsewhere: both are quantities, neither can
        // be negative, so the real sum is at least the part that was declared. The claim can
        // therefore be granted on the declared part alone and never granted on a figure
        // nobody entered. The only thing lost is a claim the undeclared half might have
        // carried, which is a refusal, and refusing is the safe direction.
        //
        // Null only when neither was declared, which is the case the row is withheld for.
        private static decimal? EpaPlusDha(NutritionInputDTO n) =>
            n.EicosapentaenoicAcid is null && n.DocosahexaenoicAcid is null
                ? null
                : (n.EicosapentaenoicAcid ?? 0m) + (n.DocosahexaenoicAcid ?? 0m);

        private static bool ClaimSourceOfOmega3(string energyUnit, NutritionInputDTO n) =>
            ClaimOmega3(energyUnit, n, SourceOfOmega3Ala, SourceOfOmega3EpaDha);

        private static bool ClaimHighOmega3(string energyUnit, NutritionInputDTO n) =>
            ClaimOmega3(energyUnit, n, HighOmega3Ala, HighOmega3EpaDha);

        private static bool ClaimOmega3(
            string energyUnit, NutritionInputDTO n, decimal alaLimit, decimal epaDhaLimit)
        {
            decimal kcal = EnergyAsKcal(energyUnit, n);

            return Omega3RouteMet(n.AlphaLinolenicAcid, alaLimit, kcal)
                || Omega3RouteMet(EpaPlusDha(n), epaDhaLimit, kcal);
        }

        // One route, both of its bases, which the Annex states as one figure read twice:
        // "at least 0,3 g alpha-linolenic acid per 100 g and per 100 kcal". So one limit
        // is compared against both, rather than a second constant standing in for the
        // same number on the energy basis.
        //
        // A route whose figure was not declared is not a route that failed; it simply is
        // not available, and the caller withholds the row rather than reporting on it.
        private static bool Omega3RouteMet(decimal? amount, decimal limit, decimal kcal) =>
            amount is decimal a
            && a >= limit
            && kcal > 0
            && a * 100m / kcal >= limit;

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

        // "A claim stating that sugars have not been added to a food ... may only be made
        // where the product does not contain any added mono- or disaccharides or any other
        // food used for its sweetening properties."
        //
        // No figure anywhere in that sentence, and the last clause is about the ingredient
        // list rather than the nutrition table: concentrated fruit juice, honey, syrup and
        // malt extract sweeten a product and then sit on the Sukkerarter row looking exactly
        // like the sugars of the fruit or the milk. So the verdict is the declaration, and
        // the row that reports it says whose declaration it was.
        //
        // The version this replaces read the nutrition table and asked a different question
        // altogether:
        //
        //     private static bool ClaimWithNoAddedSugars(decimal carbs, decimal addedSugars) =>
        //         carbs > 0 && addedSugars == 0;
        //
        // AddedSugars has been the full sugar total since the two sugar fields were merged,
        // so that tested whether the product contains no sugar at all, which is Sukkerfri
        // under another name. The carbs > 0 term is a condition the Annex states for this
        // claim nowhere.
        private static bool ClaimWithNoAddedSugars(ProductDeclarations declarations) =>
            declarations.NoAddedSugars;

        private static bool ClaimHighFibre(string foodType, string energyUnit, NutritionInputDTO n)
        {
            // "at least 6 g of fibre per 100 g or at least 3 g of fibre per 100 kcal", an
            // absolute threshold or an energy one, with no condition joining them.
            if (n.Fibre >= 6m) return true;

            decimal kcal = EnergyAsKcal(energyUnit, n);
            return kcal > 0 && n.Fibre * 100m / kcal >= 3m;
        }

        // "SOURCE OF PROTEIN ... may only be made where at least 12 % of the energy value
        // of the food is provided by protein." Named because three places read it: this
        // predicate, the nutrition row that prints it, and the four health claims whose
        // whole condition is a cross-reference to this claim. See NutritionGatedClaims.
        private const decimal SourceOfProteinEnergyShare = 12m;

        private static bool ClaimSourceOfProtein(string energyUnit, NutritionInputDTO n)
        {
            if (energyUnit == "energikcal" && n.EnergyKcal > 0)
                return n.Protein * 4m / n.EnergyKcal >= SourceOfProteinEnergyShare / 100m;
            if (energyUnit == "energikj" && n.EnergyKj > 0)
                return n.Protein * 17m / n.EnergyKj >= SourceOfProteinEnergyShare / 100m;
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

        // "no more than 0,12 g of sodium ... per 100 g or per 100 ml" = 0,3 g salt, or for
        // waters 2 mg of sodium per 100 ml = 0,005 g salt, sixty times stricter.
        private static bool ClaimLowSodium(decimal salt, ProductBasis product) =>
            salt <= (product.IsWater ? WaterLowSodium : 0.12m) * SaltPerSodium;

        // "no more than 0,04 g of sodium ..." = 0,1 g salt.
        private static bool ClaimVeryLowSodium(decimal salt) => salt <= 0.04m * SaltPerSodium;

        // "no more than 0,005 g of sodium ... per 100 g" = 0,0125 g salt.
        private static bool ClaimSodiumFree(decimal salt) => salt <= 0.005m * SaltPerSodium;

        // "does not contain any added sodium/salt or any other ingredient containing added
        // sodium/salt and the product contains no more than 0,12 g sodium ..." = 0,3 g salt.
        // "... may only be made where the product does not contain any added sodium/salt or
        // any other ingredient containing added sodium/salt and the product contains no more
        // than 0,12 g sodium, or the equivalent value for salt, per 100 g or per 100 ml."
        //
        // Two conditions joined by "and", and only the first of them needs the producer. The
        // second is the Salt figure the form already collects, which is why a ticked box does
        // not carry this claim on its own: a declared recipe at 1,2 g salt still fails.
        //
        // The term this replaces was addedSalt == 0, and AddedSalt has been hard-coded to 0
        // in the payload since the salt fields were merged, so that half of the condition was
        // being granted to every product that reached it.
        private static bool ClaimNoAddedSodium(decimal salt, ProductDeclarations declarations) =>
            declarations.NoAddedSalt && salt <= 0.12m * SaltPerSodium;

        // "at least 3 g of fibre per 100 g or at least 1,5 g of fibre per 100 kcal."
        private static bool ClaimSourceOfFibre(string energyUnit, NutritionInputDTO n)
        {
            if (n.Fibre >= 3m) return true;

            decimal kcal = EnergyAsKcal(energyUnit, n);
            return kcal > 0 && n.Fibre * 100m / kcal >= 1.5m;
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
