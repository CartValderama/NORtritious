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
            // amount per portion >= a fixed minimum, e.g. "at least 1 g per quantified
            // portion". In the substance's own unit, which is not always grams.
            PortionThreshold,
            // the substance's own amount must itself pass the HIGH FIBRE threshold
            // (>=6g/100g or >=3g/100kcal) — condition text: "food which is high in that fibre"
            HighFibreSource,
            // beta-glucan grams in the portion >= 4/30 of the carbs grams in the portion
            // (">=4g beta-glucan per 30g available carbohydrates in a quantified portion") —
            // uses the product's own portion size.
            BetaGlucanMealRatio,
            // amount per portion >= a figure the register states per day: "food which
            // provides a daily intake of 3 g of chitosan". See FormatDailyIntakeResult for
            // what is assumed and how the card says so.
            //
            // Only for a figure the register makes a condition on the food. Every claim using
            // this check says so in the same words, and it is worth checking a new one against
            // them before adding it here: "The claim may be used only for food which provides
            // a daily intake of X", or for the three that word it differently, "can be used
            // only for cocoa beverages ... which provide at least a daily intake of 200 mg",
            // "may be used only for ... kiwifruits ... providing a minimum of 200 g", "can be
            // used only for food which provides at least a daily intake of 12 g".
            //
            // A claim that names a daily figure only inside an "Information to the consumer
            // that the beneficial effect is obtained with ..." sentence is not this check. That
            // sentence is a duty about what the label must say, not a limit on what the food
            // must contain, and reading it as a threshold invents a requirement the register
            // does not impose. Those are NotComputable; see the note there.
            DailyIntakeThreshold,
            // amount per 100 g >= a fixed minimum, with no portion in it at all.
            PerHundredThreshold,
            // amount per 100 g OR amount per portion >= a fixed minimum, whichever carries
            // it: "at least 82,5 mg of choline per 100 g or 100 ml or per single portion of
            // food". Two routes joined by "or", so unlike PortionThreshold a missing portion
            // size does not withhold the claim, it just leaves the second route unavailable.
            PerHundredOrPortionThreshold,
            // amount read on two bases at once, both of which have to clear: "at least 1,5 g
            // of linoleic acid per 100 g AND per 100 kcal". The same shape as the omega-3
            // routes in the nutrition partial, which is where Omega3RouteMet answers it for
            // the fields on the form; this is the version for a picked substance.
            PerHundredAndKcalThreshold,
            // amount per portion >= a share of the carbohydrates in that portion: "at least
            // 8 g of AX-rich fibre per 100 g of available carbohydrates in a quantified
            // portion". MinAmount is the grams per 100 g of carbohydrates. The portion
            // cancels out of the ratio itself but is still required, because a quantified
            // portion is what the condition asks for.
            //
            // BetaGlucanMealRatio is the same idea at a hardcoded 4 g per 30 g, kept as it
            // is rather than converted to 13,333 so the figure in the code stays the figure
            // in the register.
            CarbsRatioThreshold,
            // No condition on the food to check, so the card reports the claim and its
            // conditions and reaches no verdict. The verdict line is CannotComputePrefix,
            // which the frontend and the report already treat as a third state beside met and
            // not met, and the amount line shows what was declared per 100 g.
            //
            // This covers the claims whose only conditions are duties about the label. The
            // plant sterols and stanols are the clearest case: "Information to the consumer
            // that the beneficial effect is obtained with a daily intake of 1,5-3 g plant
            // sterols", and then rules about how the size of the effect may be described.
            // Nothing in any of it says the food must contain a given amount.
            //
            // Five of these were briefly gated at that daily figure, which asserted a
            // requirement the register does not make. For a picked substance that is not a
            // silent miss either: the card said "Oppfyller ikke gitt krav (trenger minst 1,5 g
            // per porsjon)" to a producer who was entitled to the claim.
            //
            // The general conditions in Article 5(1)(b) and (d) of Regulation (EC) No
            // 1924/2006 do require the nutrient to be present in a quantity that produces the
            // effect, so it is not that any amount will do. But they name no figure, and the
            // quantity "reasonably expected to be consumed" is not the declared portion. That
            // is a judgement for whoever prepares the label, with the condition in front of
            // them, and not one to publish as a verdict.
            NotComputable,
        }

        private record OtherClaimRule(long PolicyItemId, OtherClaimCheck Check, decimal? MinAmount = null);

        // A selectable substance: how it is measured, and every authorised claim on it.
        //
        // Unit and IsFibre used to be hardcoded in the picker projection below, as "g" and
        // true, which held for as long as every substance here was a fibre. Melatonin is
        // measured in milligrams and activated charcoal is not a fibre, so both are the
        // substance's own property now. IsFibre is what ties a kilde to the Kostfiber figure
        // in the nutrition table: a fibre source cannot exceed the total fibre declared, and
        // charcoal or meat has nothing to do with that total.
        private record OtherSubstance(OtherClaimRule[] Rules, string Unit = "g", bool IsFibre = true);

        // Maps a selectable "Other" substance name to every EU-register claim that applies to it.
        // A substance can have more than one authorised claim (e.g. Beta-glucans has both a
        // cholesterol claim and a separate post-meal-glucose claim) — all are shown.
        private static readonly Dictionary<string, OtherSubstance> OtherClaimRegistry = new()
        {
            ["Beta-glucans"] = new(new[]
            {
                new OtherClaimRule(760097, OtherClaimCheck.PortionThreshold, 1m),
                new OtherClaimRule(760137, OtherClaimCheck.BetaGlucanMealRatio),
            }),
            // Two authorised claims on one condition. 756273 and 756309 are both
            // Art.14(1)(a), both "at least 1 g of barley beta-glucan per quantified
            // portion", and differ only in the sentence the label may carry.
            ["Barley beta-glucans"] = new(new[]
            {
                new OtherClaimRule(756273, OtherClaimCheck.PortionThreshold, 1m),
                new OtherClaimRule(756309, OtherClaimCheck.PortionThreshold, 1m),
            }),
            ["Oat beta-glucan"]    = new(new[] { new OtherClaimRule(757081, OtherClaimCheck.PortionThreshold, 1m) }),
            ["Barley grain fibre"] = new(new[] { new OtherClaimRule(760061, OtherClaimCheck.HighFibreSource) }),
            ["Rye fibre"]          = new(new[] { new OtherClaimRule(764917, OtherClaimCheck.HighFibreSource) }),
            ["Wheat bran fibre"]   = new(new[]
            {
                new OtherClaimRule(767477, OtherClaimCheck.HighFibreSource),
                new OtherClaimRule(767513, OtherClaimCheck.HighFibreSource),
            }),
            ["Oat grain fibre"]    = new(new[] { new OtherClaimRule(763813, OtherClaimCheck.HighFibreSource) }),
            ["Sugar beet fibre"]   = new(new[] { new OtherClaimRule(756641, OtherClaimCheck.HighFibreSource) }),

            // Each of these is one sentence in the register: "food which contains X per
            // quantified portion". Same rule the beta-glucan claims above already use, so
            // adding one is the line and nothing else.
            //
            // The three viscous fibres are subsets of Kostfiber like the beta-glucans.
            // Activated charcoal, lactulose and meat or fish are not: charcoal is not a
            // nutrient at all, lactulose is a disaccharide, and meat is a food rather than a
            // component of one, so none of them are budgeted against the fibre figure.
            ["Glucomannan"]        = new(new[]
            {
                new OtherClaimRule(762017, OtherClaimCheck.PortionThreshold, 1m),
                new OtherClaimRule(761973, OtherClaimCheck.DailyIntakeThreshold, 4m),
            }),
            ["Hydroxypropyl methylcellulose"] = new(new[]
            {
                new OtherClaimRule(762089, OtherClaimCheck.PortionThreshold, 4m),
                new OtherClaimRule(762125, OtherClaimCheck.DailyIntakeThreshold, 5m),
            }),
            ["Pectins"]            = new(new[]
            {
                new OtherClaimRule(764069, OtherClaimCheck.PortionThreshold, 10m),
                new OtherClaimRule(764105, OtherClaimCheck.DailyIntakeThreshold, 6m),
            }),
            ["Activated charcoal"] = new(new[] { new OtherClaimRule(759949, OtherClaimCheck.PortionThreshold, 1m) },
                                         IsFibre: false),
            ["Lactulose"]          = new(new[] { new OtherClaimRule(762653, OtherClaimCheck.PortionThreshold, 10m) },
                                         IsFibre: false),
            ["Meat or fish"]       = new(new[] { new OtherClaimRule(763365, OtherClaimCheck.PortionThreshold, 50m) },
                                         IsFibre: false),

            // ── Claims whose figure the register states per day ──────────────
            //
            // "The claim may be used only for food which provides a daily intake of 3 g of
            // chitosan" is a condition about what the food contains, written in day units.
            // It is checked against the declared portion, which is the assumption 755405
            // already rests on, and the card's amount line says so in as many words rather
            // than leaving the reader to infer it. See FormatDailyIntakeResult.
            //
            // Three substances above pick up a second rule here, because the register
            // authorises both a per-portion claim and a per-day one on the same substance,
            // at different figures: 1 g of glucomannan per portion for the glucose claim and
            // 4 g per day for the cholesterol one.
            ["Chitosan"]           = new(new[] { new OtherClaimRule(760853, OtherClaimCheck.DailyIntakeThreshold, 3m) },
                                         IsFibre: false),
            // Two claims naming the same 3 g a day, checked differently, and the difference
            // is the whole point of the note on NotComputable above.
            //
            // 761413 reads "The claim may be used only for food which provides a daily intake
            // of 3 g of creatine", which is a condition on the food. 838613 names the same
            // figure only in "the bneficial effect is obtaine with a daily intake of 3 g of
            // creatine in conjunction with resistance training", a sentence about what the
            // label must tell the reader. Its only "may be used only for" clause is about who
            // the food is for: adults over 55 in regular resistance training. So the same
            // product can be told it meets one and cannot be judged on the other, which reads
            // oddly until you read the two conditions side by side.
            //
            // 838613's register text is full of typos ("tarteting", "engagted", "bneficial",
            // "at leat", "maximum loead") and prints verbatim like every other register
            // sentence. Rewriting it here would mean putting wording on a label that is not
            // the authorised wording.
            ["Creatine"]           = new(new[]
            {
                new OtherClaimRule(761413, OtherClaimCheck.DailyIntakeThreshold, 3m),
                new OtherClaimRule(838613, OtherClaimCheck.NotComputable),
            }, IsFibre: false),
            ["Dried plums"]        = new(new[] { new OtherClaimRule(834173, OtherClaimCheck.DailyIntakeThreshold, 100m) },
                                         IsFibre: false),
            ["Guar gum"]           = new(new[] { new OtherClaimRule(762053, OtherClaimCheck.DailyIntakeThreshold, 10m) }),
            ["Native chicory inulin"] =
                                     new(new[] { new OtherClaimRule(838109, OtherClaimCheck.DailyIntakeThreshold, 12m) }),
            ["Walnuts"]            = new(new[] { new OtherClaimRule(767369, OtherClaimCheck.DailyIntakeThreshold, 30m) },
                                         IsFibre: false),
            ["Green kiwifruit"]    = new(new[] { new OtherClaimRule(2638312, OtherClaimCheck.DailyIntakeThreshold, 200m) },
                                         IsFibre: false),
            ["Vitamin C"]          = new(new[] { new OtherClaimRule(766445, OtherClaimCheck.DailyIntakeThreshold, 200m) },
                                         Unit: "mg", IsFibre: false),
            ["Cocoa flavanols"]    = new(new[] { new OtherClaimRule(835181, OtherClaimCheck.DailyIntakeThreshold, 200m) },
                                         Unit: "mg", IsFibre: false),

            // ── Claims conditioned only on what the label says ───────────────
            //
            // None of these has a condition on the food, so none reaches a verdict. The card
            // carries the claim, the register's conditions and the amount declared, and says
            // the rest is not something it can decide. See OtherClaimCheck.NotComputable for
            // why that is the honest answer rather than a gate at the figure they name.
            //
            // The plant sterols and stanols are four claims under four register substance
            // names, kept as four rows because the authorised wording differs with the name:
            // 757605's sentence is about sterols, 757729's about stanol esters, and 757557 and
            // 764289 cover either. A sterol product picks Plantesteroler for its own claim and
            // the two either-or rows for the rest, the way a barley product picks both
            // Beta-glucans and Barley beta-glucans.
            ["Plant sterols"]      = new(new[] { new OtherClaimRule(757605, OtherClaimCheck.NotComputable) },
                                         IsFibre: false),
            ["Plant stanol esters"] =
                                     new(new[] { new OtherClaimRule(757729, OtherClaimCheck.NotComputable) },
                                         IsFibre: false),
            ["Plant sterols/Plant stanol esters"] =
                                     new(new[] { new OtherClaimRule(757557, OtherClaimCheck.NotComputable) },
                                         IsFibre: false),
            ["Plant sterols and plant stanols"] =
                                     new(new[] { new OtherClaimRule(764289, OtherClaimCheck.NotComputable) },
                                         IsFibre: false),

            // One claim on two substances at two doses, "3 g WSTC I or 150 mg WSTC II", and
            // one row rather than two. Two rows were the plan while this looked like a
            // threshold, because a row carries one unit and those two doses are twenty times
            // apart; both would then have pointed at the same policy id and a producer who
            // picked both would have been handed the same card twice. With no verdict to
            // reach, the unit only labels the figure that was typed, so one row does.
            //
            // Milligrams, because WSTC II's 150 mg is the dose that needs the precision and
            // 3 g states cleanly as 3000 mg, where 150 mg in grams is 0,15.
            //
            // Two further parts of the condition would not have been checkable in any case:
            // the dose has to arrive "in up to 250 ml of either fruit juices, flavoured drinks
            // or yogurt drinks (unless heavily pasteurised)", which is about the drink the
            // concentrate is in, and the alternative route is food supplements, which is out
            // of scope.
            ["Water-Soluble Tomato Concentrate (WSTC) I and II"] =
                                     new(new[] { new OtherClaimRule(757477, OtherClaimCheck.NotComputable) },
                                         Unit: "mg", IsFibre: false),

            // ── Claims on a substance the form did not collect before ────────
            //
            // Each is one more row in the picker and nothing else: no new field, no new
            // input shape. What made them additions rather than one-liners is that none of
            // their conditions had a check yet.
            //
            // None of these six is a fibre, so none is budgeted against Kostfiber. Choline,
            // betaine and melatonin are measured in milligrams; linoleic acid is a fatty
            // acid in grams like the rest of the fat breakdown.
            //
            // All three choline claims carry the identical condition and differ only in the
            // effect the label may name, the way the four protein claims do.
            ["Choline"]            = new(new[]
            {
                new OtherClaimRule(760925, OtherClaimCheck.PerHundredOrPortionThreshold, 82.5m),
                new OtherClaimRule(760961, OtherClaimCheck.PerHundredOrPortionThreshold, 82.5m),
                new OtherClaimRule(760997, OtherClaimCheck.PerHundredOrPortionThreshold, 82.5m),
            }, Unit: "mg", IsFibre: false),

            ["Betaine"]            = new(new[] { new OtherClaimRule(760173, OtherClaimCheck.PortionThreshold, 500m) },
                                         Unit: "mg", IsFibre: false),

            // Two claims at two different figures, so two rules. 763437 is worded "food
            // which contains 1 mg of melatonin per quantified portion" with no "at least",
            // and is read as a floor like every other figure here: a gum with 2 mg has not
            // failed to contain 1 mg. Both also carry a labelling duty about when to take it,
            // reported through Vilkår for bruk.
            ["Melatonin"]          = new(new[]
            {
                new OtherClaimRule(763401, OtherClaimCheck.PortionThreshold, 0.5m),
                new OtherClaimRule(763437, OtherClaimCheck.PortionThreshold, 1m),
            }, Unit: "mg", IsFibre: false),

            ["Linoleic acid"]      = new(new[] { new OtherClaimRule(762689, OtherClaimCheck.PerHundredAndKcalThreshold, 1.5m) },
                                         IsFibre: false),

            // "At least 8 g of arabinoxylan (AX)-rich fibre produced from wheat endosperm
            // (at least 60 % AX by weight) per 100 g of available carbohydrates in a
            // quantified portion."
            //
            // The parenthesis is a condition about the ingredient's own composition, not
            // about the product, so it is reported through Vilkår for bruk rather than
            // checked: nothing on this form distinguishes an AX-rich fibre from any other.
            // The ratio is read against Karbohydrater, which the form always collects, and
            // is the same stand-in for "available carbohydrates" that the beta-glucan
            // meal-ratio claim already makes.
            ["Arabinoxylan"]       = new(new[] { new OtherClaimRule(760025, OtherClaimCheck.CarbsRatioThreshold, 8m) }),

            // Not a daily figure at all. 763885 reads "olive oil which contains at least
            // 5 mg of hydroxytyrosol and its derivatives per 20 g of olive oil", which is a
            // concentration: 25 mg per 100 g, the same ratio written on the basis this form
            // collects. The conversion is here rather than at the comparison so the figure
            // the card quotes is the figure the check used.
            //
            // "only for olive oil" is a condition about what the product is, reported
            // through Vilkår for bruk like 755661's "fats and oils".
            ["Olive oil polyphenols"] =
                                     new(new[] { new OtherClaimRule(763885, OtherClaimCheck.PerHundredThreshold, 25m) },
                                         Unit: "mg", IsFibre: false),
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

        // Which of the two carry a claim that reads them on their own and states its figure
        // per portion, so the picker can say up front that Porsjonsstørrelse will be needed.
        //
        // Calcium does, through 837853 at 400 mg per quantified portion. Vitamin D does not:
        // the only claim that reads it is the combined one, which needs calcium as well, so
        // flagging vitamin D alone would show the hint in cases where it is not needed.
        //
        // A set rather than a test written into the picker projection, for the reason
        // NeedsPortionSize exists: the flag was a hardcoded false there, correct while the
        // combined claim was the only one in scope, and wrong the moment 837853 was added.
        // Adding a vitamin or mineral claim means adding its nutrient here.
        private static readonly HashSet<string> PortionClaimNutrients =
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
        // amount": 15 % of the NRV per 100 g, or 7,5 % per 100 ml for beverages. So all nine
        // shared one gate and differed only in which claim text was shown.
        //
        // Withheld by the product owner's decision, and commented out rather than deleted.
        // Reaching a verdict here means following a condition out of the register into the
        // Annex to Regulation (EC) No 1924/2006, and from there into the "significant amount"
        // defined in Annex XIII to Regulation (EU) No 1169/2011. Every other condition this
        // calculator checks states its own figure; this one is three documents of reading
        // before a number appears, and a card printing "oppfylt" would be publishing that
        // reading as a verdict on the label's behalf. The uncertainty is about the chain, not
        // about the arithmetic.
        //
        // Switching them back on is uncommenting the two lines below and the block in
        // BuildVitaminMineralClaimResults that consumed them. FormatSourceOfResult, which
        // holds the 15 % / 7,5 % gate and its NRV citation, is left in place for that day.
        //
        // The combined "Kalsium og vitamin D" claim is not affected and still runs: see
        // CalciumVitaminDPortionClaimId, whose condition is a plain 400 mg and 15 µg per
        // daily portion with no cross-reference in it. Calcium and vitamin D therefore stay
        // in the kilde picker, and entering only one of them now yields no claim at all.
        private static readonly Dictionary<string, long[]> SourceOfClaimIds =
            new(StringComparer.OrdinalIgnoreCase)
            {
                // [CalciumName] = new[] { 757897L, 760473L, 760509L, 760545L, 760581L, 760617L, 760653L },
                // [VitaminDName] = new[] { 766997L, 767037L },
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

        // The same effect claimed on calcium alone: "food which provides at least 400 mg of
        // calcium per quantified portion". Same figure as the calcium half above and the same
        // target population, so the only difference in what has to be checked is that vitamin
        // D does not come into it.
        //
        // Worth noting which of the two is about food. 755405 reads "only for food
        // supplements" and is served anyway, by the product owner's decision, with that
        // restriction left to the reader through Vilkår for bruk. This one says "only for
        // food", so it is the one that fits a calculator for food, and it is added beside
        // 755405 rather than in place of it: both are authorised and a product meeting both
        // conditions carries both claims.
        //
        // One consequence for the form. Entering calcium without vitamin D used to yield no
        // claim at all, because the combined claim below needs both. It now yields this one.
        private const long CalciumPortionClaimId = 837853;
        private const decimal CalciumPortionMinMg = 400m;

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
                ["Sugar beet fibre"] = "Sukkerbetefiber",
                ["Glucomannan"] = "Glukomannan",
                ["Hydroxypropyl methylcellulose"] = "Hydroksypropylmetylcellulose",
                ["Pectins"] = "Pektin",
                ["Activated charcoal"] = "Aktivt kull",
                ["Lactulose"] = "Laktulose",
                ["Meat or fish"] = "Kjøtt eller fisk",
                ["Chitosan"] = "Kitosan",
                ["Creatine"] = "Kreatin",
                ["Dried plums"] = "Tørkede svisker",
                ["Guar gum"] = "Guarkjernemel",
                ["Native chicory inulin"] = "Inulin fra sikori",
                ["Walnuts"] = "Valnøtter",
                ["Green kiwifruit"] = "Grønn kiwi",
                ["Vitamin C"] = "Vitamin C",
                ["Cocoa flavanols"] = "Kakaoflavanoler",
                ["Olive oil polyphenols"] = "Polyfenoler i olivenolje",
                ["Plant sterols"] = "Plantesteroler",
                ["Plant stanol esters"] = "Plantestanolestere",
                ["Plant sterols/Plant stanol esters"] = "Plantesteroler og plantestanolestere",
                ["Plant sterols and plant stanols"] = "Plantesteroler og plantestanoler",
                ["Water-Soluble Tomato Concentrate (WSTC) I and II"] =
                    "Vannløselig tomatkonsentrat (WSTC I og II)",
                ["Choline"] = "Kolin",
                ["Betaine"] = "Betain",
                ["Melatonin"] = "Melatonin",
                ["Linoleic acid"] = "Linolsyre",
                ["Arabinoxylan"] = "Arabinoksylan",
            };

        private static string NutrientLabel(string name) =>
            NutrientLabels.GetValueOrDefault(name, name);

        // Whether a check cannot reach a verdict at all without the declared portion size, so
        // the picker can say up front that Porsjonsstørrelse will be needed.
        //
        // Read off the check rather than listed at the picker, which is where this lived and
        // where it had already gone stale: BetaGlucanMealRatio needs a portion and was not in
        // that list, and got away with it only because its substance carries a per-portion
        // rule as well. A substance whose only rule is a ratio, like Arabinoxylan, would not
        // have asked for one.
        //
        // PerHundredOrPortionThreshold is deliberately false: its per-100 route needs no
        // portion, so a product that clears that route should not be told to supply one.
        private static bool NeedsPortionSize(OtherClaimCheck check) => check switch
        {
            OtherClaimCheck.PortionThreshold => true,
            OtherClaimCheck.DailyIntakeThreshold => true,
            OtherClaimCheck.BetaGlucanMealRatio => true,
            OtherClaimCheck.CarbsRatioThreshold => true,
            _ => false,
        };

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
            [756641] = "Les EFSA-uttalelsen om sukkerbetefiber og avføringsvolum",
            [764437] = "Les EFSA-uttalelsen om protein og vekst i muskelmasse",
            [764477] = "Les EFSA-uttalelsen om protein og vedlikehold av muskelmasse",
            [764517] = "Les EFSA-uttalelsen om protein og vedlikehold av normale bein",
            [758077] = "Les EFSA-uttalelsen om protein og beinvekst hos barn",
            [755661] = "Les EFSA-uttalelsen om umettet fett, blodkolesterol og hjertesykdom",
            [763545] = "Les EFSA-uttalelsen om umettet fett og LDL-kolesterol",
            [763849] = "Les EFSA-uttalelsen om oljesyre og LDL-kolesterol",
            [759985] = "Les EFSA-uttalelsen om alfa-linolensyre og blodkolesterol",
            [761529] = "Les EFSA-uttalelsen om EPA, DHA og hjertefunksjon",
            [756309] = "Les EFSA-uttalelsen om betaglukaner fra bygg og blodkolesterol",
            [761449] = "Les EFSA-uttalelsen om DHA og hjernefunksjon",
            [761489] = "Les EFSA-uttalelsen om DHA og synet",
            [762017] = "Les EFSA-uttalelsen om glukomannan og vekttap",
            [762089] = "Les EFSA-uttalelsen om HPMC og blodsukker etter måltid",
            [764069] = "Les EFSA-uttalelsen om pektin og blodsukker etter måltid",
            [759949] = "Les EFSA-uttalelsen om aktivt kull og tarmgass",
            [762653] = "Les EFSA-uttalelsen om laktulose og tarmpassasje",
            [763365] = "Les EFSA-uttalelsen om kjøtt eller fisk og opptak av jern",
            // Withheld with the chewing gum claims themselves.
            // [765261] = "Les EFSA-uttalelsen om sukkerfri tyggegummi og tannmineralisering",
            // [765305] = "Les EFSA-uttalelsen om sukkerfri tyggegummi og plakksyrer",
            // [765345] = "Les EFSA-uttalelsen om sukkerfri tyggegummi og munntørrhet",
            // [765381] = "Les EFSA-uttalelsen om tyggegummi med karbamid og plakksyrer",
            // [756929] = "Les EFSA-uttalelsen om sukkerfri tyggegummi og nøytralisering av plakksyrer",
            // [756969] = "Les EFSA-uttalelsen om sukkerfri tyggegummi og demineralisering av tenner",
            [760853] = "Les EFSA-uttalelsen om kitosan og blodkolesterol",
            [761413] = "Les EFSA-uttalelsen om kreatin og fysisk yteevne",
            [834173] = "Les EFSA-uttalelsen om svisker og tarmfunksjon",
            [762053] = "Les EFSA-uttalelsen om guarkjernemel og blodkolesterol",
            [838109] = "Les EFSA-uttalelsen om inulin fra sikori og tarmfunksjon",
            [767369] = "Les EFSA-uttalelsen om valnøtter og blodårene",
            [2638312] = "Les EFSA-uttalelsen om grønn kiwi og tarmfunksjon",
            [766445] = "Les EFSA-uttalelsen om vitamin C og immunforsvaret etter hard trening",
            [835181] = "Les EFSA-uttalelsen om kakaoflavanoler og blodårenes elastisitet",
            [838613] = "Les EFSA-uttalelsen om kreatin, styrketrening og muskelstyrke",
            [757605] = "Les EFSA-uttalelsen om plantesteroler og blodkolesterol",
            [757729] = "Les EFSA-uttalelsen om plantestanolestere og blodkolesterol",
            [757557] = "Les EFSA-uttalelsen om plantesteroler, plantestanolestere og blodkolesterol",
            [764289] = "Les EFSA-uttalelsen om plantesteroler, plantestanoler og blodkolesterol",
            [837853] = "Les EFSA-uttalelsen om kalsium og tap av beinmineral",
            [757477] = "Les EFSA-uttalelsen om vannløselig tomatkonsentrat og blodplater",
            [763885] = "Les EFSA-uttalelsen om polyfenoler i olivenolje og blodfettene",
            [761973] = "Les EFSA-uttalelsen om glukomannan og blodkolesterol",
            [762125] = "Les EFSA-uttalelsen om HPMC og blodkolesterol",
            [764105] = "Les EFSA-uttalelsen om pektin og blodkolesterol",
            [755369] = "Les EFSA-uttalelsen om DHA og hjerneutviklingen hos fosteret",
            [756569] = "Les EFSA-uttalelsen om DHA og øyeutviklingen hos fosteret",
            [761901] = "Les EFSA-uttalelsen om mettet fett og blodkolesterol",
            [761937] = "Les EFSA-uttalelsen om natrium og blodtrykk",
            [831109] = "Les EFSA-uttalelsen om DHA og triglyserider i blodet",
            [833485] = "Les EFSA-uttalelsen om EPA, DHA og blodtrykk",
            [833785] = "Les EFSA-uttalelsen om EPA, DHA og triglyserider i blodet",
            [760925] = "Les EFSA-uttalelsen om kolin og homocysteinomsetningen",
            [760961] = "Les EFSA-uttalelsen om kolin og fettomsetningen",
            [760997] = "Les EFSA-uttalelsen om kolin og leverfunksjonen",
            [760173] = "Les EFSA-uttalelsen om betain og homocysteinomsetningen",
            [763401] = "Les EFSA-uttalelsen om melatonin og jetlag",
            [763437] = "Les EFSA-uttalelsen om melatonin og innsovningstid",
            [762689] = "Les EFSA-uttalelsen om linolsyre og blodkolesterol",
            [760025] = "Les EFSA-uttalelsen om arabinoksylan og blodsukker etter måltid",
            [836625] = "Les EFSA-uttalelsen om karbohydrater og hjernefunksjon",
        };

        // Resistant starch (764557) isn't a user-selectable "Other" substance like the ones above —
        // its condition needs two dedicated nutrition fields (TotalStarch/ResistantStarch), so it's
        // checked directly from NutritionInputDTO instead, alongside the Karbohydrater claims.
        private const long ResistantStarchClaimId = 764557;

        // The two Karbohydrater claims, and they ended up in opposite places.
        //
        // 836625 "brain function" is live again, as NutritionGate.CarbsBrainFunction, which
        // is also where the history of its removal and the one assumption it still rests on
        // are written down. It is no longer checked here.
        //
        // 836661 "muscle recovery" stays out, but not for the reason written here before.
        // The 4 g per kg of body weight is inside its "Information shall be given to the
        // consumer" sentence, so it is a duty for the label and not a condition on the food,
        // the same reading that moved the plant sterols to NotComputable. Its actual condition
        // is "food which provides carbohydrates which are metabolised by humans (excluding
        // polyols)", which MetabolisableCarbs already computes.
        //
        // So it is checkable, and left out anyway: that condition is met by any product with
        // carbohydrate in it, so every bread, pasta and piece of fruit would carry a card
        // about recovery from intensive exercise. That is the complaint that had 836625
        // removed the first time.

        // The kilde picker's options. Neither the category nor the food type changes them, so
        // they're built once at startup rather than per request. Nothing mutates the list or
        // the options in it; they are serialised onto the schema response as they are.
        //
        // Everything here is read off the substance rather than listed by hand, so a kilde
        // that stops being a fibre, changes unit, or stops being per-portion says so in one
        // place and the picker follows.
        private static readonly List<KildeOptionDTO> KildeOptions = OtherClaimRegistry
            .Select(entry => new KildeOptionDTO
            {
                Value = entry.Key,
                Label = NutrientLabel(entry.Key),
                Unit = entry.Value.Unit,
                Kind = "other",
                RequiresKostfiber = entry.Value.IsFibre,
                RequiresPortionSize = entry.Value.Rules.Any(r => NeedsPortionSize(r.Check)),
            })
            .Concat(VitaminMineralDefs.Select(entry => new KildeOptionDTO
            {
                Value = entry.Key,
                Label = NutrientLabel(entry.Key),
                Unit = entry.Value.Unit,
                Kind = MineralNames.Contains(entry.Key) ? "mineral" : "vitamin",
                RequiresKostfiber = false,
                RequiresPortionSize = PortionClaimNutrients.Contains(entry.Key),
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

            // Computed once for the whole request rather than per substance, because it is a
            // question about all of them together.
            var fibreBudget = FibreBudgetFor(n, others);

            foreach (var o in others)
            {
                // A name with no registered claim is skipped, the same as an unregistered
                // vitamin or mineral. The picker only offers registry keys, so this can only
                // be reached by a request that didn't come from the form.
                if (OtherClaimRegistry.TryGetValue(o.Name, out var substance))
                    results.AddRange(await BuildEuOtherClaimResults(o.Name, o.Amount, portionSize, n, foodType, energyUnit, substance, fibreBudget));
            }

            return results;
        }

        // What the picked fibre kilder come to, against the fibre that was declared.
        //
        // Kostfiber is one budget shared by all of them, which is what makes this different
        // from the SubstanceSubsets in CalculatorService: those each sit under a parent figure
        // of their own, so each is compared on its own. Two fibre kilder can each be under the
        // declared total and still be impossible together.
        //
        // The other difference is what the parent is. Kostfiber is mandatory in a nutrition
        // declaration, so it is always there to compare against, and it is load-bearing: HIGH
        // FIBRE, SOURCE OF FIBRE and the Nøkkelhullet rules all read it. A linoleic acid
        // figure above the declared polyunsaturated fat gets a warning and keeps its verdict,
        // because that parent is voluntary and is arguably the likelier of the two to be
        // wrong. Here the parent is the figure under scrutiny everywhere else, so the kilde is
        // the likelier error and the claim is withheld.
        //
        // Withholding is also the safe direction for a tool whose output goes onto a label: it
        // can only cost a claim that might have held, never grant one that does not.
        private readonly record struct FibreBudget(decimal Claimed, decimal Declared)
        {
            public bool Exceeded => Claimed > Declared;
        }

        private static FibreBudget FibreBudgetFor(
            NutritionInputDTO n, List<OtherClaimInputDTO> others) =>
            new(others
                    .Where(o => OtherClaimRegistry.TryGetValue(o.Name, out var s) && s.IsFibre)
                    .Sum(o => o.Amount),
                n.Fibre);

        // Substances with a known EU Health Claims register entry (OtherClaimRegistry). Each
        // rule is checked against the data this calculator actually collects.
        private async Task<List<HealthClaimResultDTO>> BuildEuOtherClaimResults(
            string nutrient, decimal amount, decimal portionSize, NutritionInputDTO n, string foodType,
            string energyUnit, OtherSubstance substance, FibreBudget fibreBudget)
        {
            var results = new List<HealthClaimResultDTO>();
            string unit = substance.Unit;

            // Replaces the verdict rather than skipping the card. A claim that simply vanished
            // would read as one the product does not carry, and the point is to say why no
            // verdict was reached. The card still shows the claim and its conditions.
            bool overBudget = substance.IsFibre && fibreBudget.Exceeded;

            foreach (var rule in substance.Rules)
            {
                var euClaim = await _euHealthClaims.GetByIdAsync(rule.PolicyItemId);
                if (euClaim == null) continue;

                string meetsReq = overBudget
                    ? $"Oppfyller ikke gitt krav (valgte fiberkilder utgjør "
                      + $"{FormatNo(fibreBudget.Claimed)} g {PerHundredLabel(foodType)}, men "
                      + $"Kostfiber er oppgitt som {FormatNo(fibreBudget.Declared)} g)"
                    : rule.Check switch
                {
                    OtherClaimCheck.PortionThreshold =>
                        FormatPortionThresholdResult(amount, portionSize, rule.MinAmount!.Value, unit),
                    OtherClaimCheck.DailyIntakeThreshold =>
                        FormatDailyIntakeResult(amount, portionSize, rule.MinAmount!.Value, unit),
                    OtherClaimCheck.PerHundredThreshold =>
                        FormatPerHundredThresholdResult(amount, rule.MinAmount!.Value, unit, foodType),
                    OtherClaimCheck.PerHundredOrPortionThreshold =>
                        FormatPerHundredOrPortionThresholdResult(
                            amount, portionSize, rule.MinAmount!.Value, unit, foodType),
                    OtherClaimCheck.PerHundredAndKcalThreshold =>
                        FormatPerHundredAndKcalThresholdResult(
                            amount, rule.MinAmount!.Value, unit, foodType, energyUnit, n),
                    OtherClaimCheck.CarbsRatioThreshold =>
                        FormatCarbsRatioThresholdResult(
                            amount, portionSize, rule.MinAmount!.Value, n.Carbs, unit),
                    OtherClaimCheck.HighFibreSource =>
                        FormatHighFibreSourceResult(amount, energyUnit, n),
                    OtherClaimCheck.BetaGlucanMealRatio =>
                        FormatBetaGlucanMealRatioResult(amount, portionSize, n.Carbs),
                    _ => CannotComputePrefix,
                };

                // Only the per-portion rule compares against something other than the number
                // that was typed in, so only it restates the amount on that basis.
                string amountDisplay = rule.Check switch
                {
                    OtherClaimCheck.PortionThreshold =>
                        FormatPortionAmount(amount, portionSize, unit, foodType),

                    // The assumption is named here rather than in the verdict, because the
                    // verdict's met text is matched exactly by the frontend and the report to
                    // decide a card's colour, and anything appended to it reads as a failure.
                    // The amount line is where the basis belongs anyway: it is what every
                    // other claim's amount already restates.
                    OtherClaimCheck.DailyIntakeThreshold =>
                        FormatDailyIntakeAmount(amount, portionSize, unit, foodType),

                    _ => FormatPerHundredAmount(amount, unit, foodType),
                };

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

                // The amount is still recorded, because the combined claim below reads both
                // nutrients back from here.
                //
                // What follows is commented out with the ids in SourceOfClaimIds, rather than
                // left to iterate a deliberately empty list: a loop that can never produce a
                // row reads as a bug to whoever finds it next. The comment on those ids says
                // why they are withheld.
                //
                // The source-of threshold is itself per 100 g / 100 ml, so the typed number is
                // already the one being compared. Nothing to restate but the basis.
                //
                // string amountDisplay = FormatPerHundredAmount(amount, def.Unit, foodType);
                // string meetsReq = FormatSourceOfResult(amount, def, foodType);
                //
                // foreach (var id in SourceOfClaimIds.GetValueOrDefault(input.Name, Array.Empty<long>()))
                // {
                //     var euClaim = await _euHealthClaims.GetByIdAsync(id);
                //     if (euClaim == null) continue;
                //     results.Add(BuildEuClaimResult(input.Name, amountDisplay, meetsReq, id, euClaim));
                // }
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

            // Calcium on its own, which needs no second nutrient. Outside the block above
            // rather than inside it, so a product that declares both still gets this card as
            // well as the combined one. See CalciumPortionClaimId.
            if (amounts.TryGetValue(CalciumName, out decimal calciumOnlyMg))
            {
                var calciumClaim = await _euHealthClaims.GetByIdAsync(CalciumPortionClaimId);
                if (calciumClaim != null)
                    results.Add(BuildEuClaimResult(
                        CalciumName,
                        portionSize > 0
                            ? $"{FormatNo(Math.Round(calciumOnlyMg * portionSize / 100m, 3))} mg per porsjon"
                            : $"{FormatNo(calciumOnlyMg)} mg {PerHundredLabel(foodType)}",
                        FormatCalciumPortionResult(calciumOnlyMg, portionSize),
                        CalciumPortionClaimId,
                        calciumClaim));
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

        // 837853's figure, which is the calcium half of the one above with nothing else
        // joined to it.
        private static string FormatCalciumPortionResult(decimal calciumMgPer100, decimal portionSize)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";

            decimal inPortion = Math.Round(calciumMgPer100 * portionSize / 100m, 3);
            return inPortion >= CalciumPortionMinMg
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(CalciumPortionMinMg)} mg per porsjon, " +
                  $"porsjonen inneholder {FormatNo(inPortion)} mg)";
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

        // "Food which provides a daily intake of X of the substance."
        //
        // The figure is about the food, not about a recommendation: a claim may be made only
        // for a food that delivers that much. What the register does not say is over how much
        // food, so the declared portion stands in for the day's intake, which is the same
        // assumption 755405 rests on and was accepted for the same reason: the alternative is
        // to check nothing at all.
        //
        // It is a longer reach than 755405's, whose text at least says "per daily portion"
        // where these say only "per day", so the amount line on the card states the
        // substitution outright instead of leaving it to be inferred. See
        // FormatDailyIntakeAmount, and the condition itself is printed in full under Vilkår
        // for bruk as always.
        private static string FormatDailyIntakeResult(
            decimal amountPer100, decimal portionSize, decimal minPerDay, string unit)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";

            decimal amountInPortion = Math.Round(amountPer100 * portionSize / 100m, 3);
            return amountInPortion >= minPerDay
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(minPerDay)} {unit} per dag, " +
                  $"porsjonen inneholder {FormatNo(amountInPortion)} {unit})";
        }

        // The amount beside a daily-intake verdict, which has to say what was substituted for
        // what. "3 g per porsjon" alone beside a condition written per day would look like a
        // figure the register asked for.
        private static string FormatDailyIntakeAmount(
            decimal amountPer100, decimal portionSize, string unit, string foodType)
        {
            if (amountPer100 <= 0) return "ikke oppgitt";
            if (portionSize <= 0) return FormatPerHundredAmount(amountPer100, unit, foodType);
            return $"{FormatNo(Math.Round(amountPer100 * portionSize / 100m, 3))} {unit} " +
                   "per porsjon, regnet som dagsinntak";
        }

        // A plain concentration, with no portion and no conversion at the comparison: the
        // number typed in is already the number being compared.
        private static string FormatPerHundredThresholdResult(
            decimal amountPer100, decimal minPer100, string unit, string foodType)
        {
            string per = PerHundredLabel(foodType);
            return amountPer100 >= minPer100
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(minPer100)} {unit} {per}, " +
                  $"produktet inneholder {FormatNo(amountPer100)} {unit})";
        }

        // "At least X per 100 g or 100 ml or per single portion of food." Two routes joined
        // by "or", so either one carries the claim and a missing portion size only closes the
        // second. The per-portion route can only help where the portion is heavier than 100 g,
        // but it is checked rather than reasoned about, because the condition offers it.
        private static string FormatPerHundredOrPortionThresholdResult(
            decimal amountPer100, decimal portionSize, decimal min, string unit, string foodType)
        {
            if (amountPer100 >= min) return MeetsRequirementText;

            string per = PerHundredLabel(foodType);
            if (portionSize <= 0)
                return $"Oppfyller ikke gitt krav (trenger minst {FormatNo(min)} {unit} {per} " +
                       $"eller per porsjon, produktet har {FormatNo(amountPer100)} {unit} {per} " +
                       "og porsjonsstørrelse mangler)";

            decimal amountInPortion = Math.Round(amountPer100 * portionSize / 100m, 3);
            return amountInPortion >= min
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(min)} {unit} {per} eller " +
                  $"per porsjon, produktet har {FormatNo(amountPer100)} {unit} {per} og " +
                  $"{FormatNo(amountInPortion)} {unit} per porsjon)";
        }

        // "At least X per 100 g and per 100 kcal." One figure on two bases, both of which have
        // to clear, which is the test Omega3RouteMet performs on the form's own fatty-acid
        // fields. Written separately rather than reusing that helper because this one has to
        // report which of the two bases fell short, and in the substance's own unit.
        //
        // No energy means no second basis, so the claim is withheld rather than decided on the
        // first alone. An empty form must not produce a verdict, which is the rule
        // EnergyEntered exists for.
        private static string FormatPerHundredAndKcalThresholdResult(
            decimal amountPer100, decimal min, string unit, string foodType,
            string energyUnit, NutritionInputDTO n)
        {
            decimal kcal = EnergyAsKcal(energyUnit, n);
            if (kcal <= 0) return $"{CannotComputePrefix} (energi mangler)";

            decimal per100Kcal = Math.Round(amountPer100 * 100m / kcal, 3);
            string per = PerHundredLabel(foodType);
            return amountPer100 >= min && per100Kcal >= min
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(min)} {unit} både {per} og " +
                  $"per 100 kcal, produktet har {FormatNo(amountPer100)} {unit} {per} og " +
                  $"{FormatNo(per100Kcal)} {unit} per 100 kcal)";
        }

        // "At least X of the substance per 100 g of available carbohydrates in a quantified
        // portion", with minPerHundredCarbs being that X.
        //
        // The portion cancels out of a ratio, so this reaches the same verdict for any portion
        // size. It is still required, for the reason BetaGlucanMealRatio requires it: the
        // condition asks for a quantified portion, and the figures the card reports are the
        // ones in that portion.
        private static string FormatCarbsRatioThresholdResult(
            decimal amountPer100, decimal portionSize, decimal minPerHundredCarbs,
            decimal carbsPer100g, string unit)
        {
            if (portionSize <= 0) return $"{CannotComputePrefix} (porsjonsstørrelse mangler)";

            decimal carbsPerPortion = carbsPer100g * portionSize / 100m;
            if (carbsPerPortion <= 0) return $"{CannotComputePrefix} (ingen karbohydrater oppgitt)";

            decimal amountInPortion = Math.Round(amountPer100 * portionSize / 100m, 3);
            decimal required = Math.Round(carbsPerPortion * minPerHundredCarbs / 100m, 3);
            return amountInPortion >= required
                ? MeetsRequirementText
                : $"Oppfyller ikke gitt krav (trenger minst {FormatNo(required)} {unit} per porsjon " +
                  $"mot {FormatNo(Math.Round(carbsPerPortion, 3))} g karbohydrater, porsjonen " +
                  $"inneholder {FormatNo(amountInPortion)} {unit})";
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

        // ── Health claims gated by a nutrition claim ─────────────────────────
        //
        // Nine authorised claims whose entire condition of use is one sentence pointing at a
        // nutrition claim: "may be used only for food which is at least a source of protein
        // as referred to in the claim SOURCE OF PROTEIN as listed in the Annex to Regulation
        // (EC) No 1924/2006", and the same sentence for HIGH UNSATURATED FAT and for SOURCE
        // OF OMEGA 3 FATTY ACIDS.
        //
        // That is the same shape as the calcium and vitamin D claims withheld further up this
        // file, and these are implemented for the reason those are not. The nutrition claims
        // these point at are ones the calculator already evaluates, from figures the Annex
        // itself states, and already shows with those figures in the EFSA nutrition section.
        // Nothing has to be read into them. The withheld ones point instead at SOURCE OF
        // [NAME OF VITAMIN/S] AND/OR [NAME OF MINERAL/S], whose figure is not in the Annex
        // at all but in the "significant amount" of Annex XIII to Regulation (EU) No
        // 1169/2011.
        //
        // Every gate below calls the very predicate the nutrition row was built from, so a
        // health card here cannot reach a different verdict than the nutrition claim it
        // depends on.
        private enum NutritionGate
        {
            // SOURCE OF PROTEIN: at least 12 % of the energy from protein.
            SourceOfProtein,
            // HIGH UNSATURATED FAT: at least 70 % of the fatty acids from mono- and
            // polyunsaturated fat, and more than 20 % of the energy from them.
            HighUnsaturatedFat,
            // The alfa-linolensyre route of SOURCE OF OMEGA 3 FATTY ACIDS: at least 0,3 g
            // per 100 g and per 100 kcal. That route specifically and not the claim as a
            // whole, because the condition reads "at least a source of ALA": a product
            // carrying the nutrition claim on EPA and DHA alone is not a source of ALA and
            // must not be given this card.
            SourceOfAla,
            // The other route, at least 40 mg of the two summed on the same two bases, and
            // likewise only that route.
            SourceOfEpaDha,
            // Not a route of that claim at all: 761449 and 761489 state their own figure,
            // "at least 40 mg of DHA per 100 g and per 100 kcal", measured on DHA by itself.
            // It is the same number as the EPA and DHA route above and is not the same test,
            // so it gets its own constant rather than borrowing SourceOfOmega3EpaDha.
            DhaAlone,
            // Also DHA on its own, and also per portion, but against a figure the register
            // states per day: "food which provides a daily intake of at least 200 mg DHA".
            // Separate from DhaAlone because that one is a concentration and this one is a
            // quantity in a serving, so they can disagree about the same product.
            DhaDailyIntake,
            // "Food which is at least low in saturated fatty acids, as referred to in the
            // claim LOW SATURATED FAT, or reduced in saturated fatty acids as referred to in
            // the claim REDUCED [NAME OF NUTRIENT]." 761901.
            //
            // Two routes joined by "or", and only the first is answerable here: REDUCED is
            // one of the four Annex claims that needs a reference product's figure, which the
            // form does not collect. So a product that qualifies only by being reduced gets
            // no card. That is a miss, never a wrong grant, which is the safe direction and
            // the same trade accepted on SourceOfAla. Wire it up to the reference-product
            // input when that exists.
            LowSaturatedFat,
            // The same sentence about sodium, pointing at LOW SODIUM/SALT. 761937, with the
            // same half-answered "or reduced" route.
            LowSodium,
            // "Food which provides a daily intake of 2 g of DHA and which contains DHA in
            // combination with eicosapentaenoic acid (EPA)." 831109.
            //
            // Two conditions, not one: the figure is on DHA by itself, and EPA has to be
            // present at all. That second half is why this is not EpaDhaDailyIntake2g under
            // another label, even though both come to 2 g: there the 2 g is the sum, here the
            // sum is irrelevant and only DHA counts toward it.
            DhaWithEpaDailyIntake,
            // "Food which provides a daily intake of 2 g of EPA and DHA." 833785, on the sum
            // the form collects as two fields and EpaPlusDha adds.
            EpaDhaDailyIntake2g,
            // The same test at 3 g, for the blood-pressure claim 833485. A separate member
            // rather than a threshold passed in, because the gate is what the switch below
            // reads and a gate that means two different numbers is how a card ends up
            // reporting the wrong one.
            EpaDhaDailyIntake3g,
            // 836625: "food which contains at least 20 g carbohydrates which are metabolised
            // by humans, excluding polyols, per quantified portion and complies with the
            // nutrition claim LOW SUGARS or WITH NO ADDED SUGARS". Its third sentence, that
            // the effect needs 130 g of carbohydrate a day from all sources, is a duty for
            // the label and is reported through Vilkår for bruk.
            //
            // This claim was live once and was deleted in 9f00c1e with the note "removed at
            // product owner's request". Two things about that version are worth knowing
            // before reading this one as a reversal of their decision:
            //
            //  - It was gated on nothing but "n.Carbs <= 0" and then showed its verdict
            //    whether it passed or failed, so nearly every product opened the health panel
            //    with a carbohydrate refusal nobody had asked for. That is the complaint the
            //    met-only rule above exists to answer, and this entry is met-only.
            //  - Its sugar half read ClaimWithNoAddedSugars(carbs, addedSugars), the
            //    signature whose own comment now records that it tested whether the product
            //    contained no sugar at all once the two sugar fields were merged, which is
            //    Sukkerfri under another name. It now reads the producer's declaration.
            //
            // "Excluding polyols" is read off a declared polyol figure rather than assumed
            // away. It was assumed away for one day: total carbohydrate includes polyols by
            // the definition in Annex I to Regulation (EU) No 1169/2011, and a polyol-
            // sweetened product also tends to clear LOW SUGARS, so such a product would have
            // been granted this card on carbohydrate it does not metabolise. The form asks
            // for the figure now. See MetabolisableCarbs.
            CarbsBrainFunction,
            // Withheld with the six claims that used it. "Chewing gum which complies with
            // the conditions of use for the nutrition claim SUGARS FREE" is two things the
            // calculator already knows: what kind of product this is, from Produkttype, and
            // whether it clears 0,5 g sugars per 100 g, from ClaimSugarsFree.
            //
            // Nothing about the check was wrong. What is missing is a way in: Nøkkelhullet
            // has no category for sweets or chewing gum, categories 1 to 32 cover none of
            // them, and the form asks for a matkategori before it shows a nutrition table at
            // all. So the only way to reach these six was to declare the gum as some
            // unrelated category, which would then be assessed against that category's
            // Nøkkelhullet limits and its EFSA claims. A right answer nobody can reach
            // honestly is worse than no answer.
            //
            // Switching them back on is uncommenting this, the six entries in
            // NutritionGatedClaims, the two switch arms that read them, ProductBasis
            // .IsChewingGum, and the Tyggegummi option in ProductInfoSection.jsx. The real
            // prerequisite is a way to assess a product that Nøkkelhullet does not cover.
            // SugarsFreeChewingGum,
        }

        // 761449 and 761489's own figure. Written in grams because the form asks in grams,
        // like the two omega-3 limits in the Annex it sits beside.
        private const decimal DhaAloneMinG = 0.04m;   // 40 mg

        // 755369 and 756569, the two claims about maternal intake, in the same unit.
        private const decimal DhaDailyIntakeMinG = 0.2m;   // 200 mg per day

        // The three high-dose omega-3 claims, whose figures the register states in grams per
        // day outright rather than in milligrams. Written as the register writes them.
        private const decimal DhaWithEpaDailyIntakeMinG = 2m;    // 831109
        private const decimal EpaDhaDailyIntake2MinG = 2m;       // 833785
        private const decimal EpaDhaDailyIntake3MinG = 3m;       // 833485

        // 836625, per quantified portion rather than per day: the register states this one
        // about the food outright.
        private const decimal CarbsBrainFunctionMinPerPortionG = 20m;

        // Nutrient is the Norwegian heading the card carries. Written in Norwegian here
        // rather than as the register's English name, because none of these are picker
        // substances whose name has to match what the request sends back; NutrientLabel
        // passes through anything it has no translation for.
        private record NutritionGatedClaim(long PolicyItemId, string Nutrient, NutritionGate Gate);

        private static readonly NutritionGatedClaim[] NutritionGatedClaims =
        {
            // All four authorised protein claims carry the identical condition. 758077 is an
            // Art.14(1)(b) claim about children's development and the other three are
            // Art.13(1), which changes what the claim may say but not what it requires.
            new(764437, "Protein", NutritionGate.SourceOfProtein),
            new(764477, "Protein", NutritionGate.SourceOfProtein),
            new(764517, "Protein", NutritionGate.SourceOfProtein),
            new(758077, "Protein", NutritionGate.SourceOfProtein),

            // 755661 carries a second condition the calculator cannot see, "the claim may
            // only be used on fats and oils". Like every other condition about what kind of
            // product this is, it is reported through Vilkår for bruk rather than used to
            // withhold a verdict. See the note on MeetsRequirementText.
            new(755661, "Umettet fett", NutritionGate.HighUnsaturatedFat),
            new(763545, "Umettet fett", NutritionGate.HighUnsaturatedFat),
            // A claim about oleic acid whose condition is nevertheless about unsaturated fat
            // as a whole, which is why the amount beside it names what was measured.
            new(763849, "Oljesyre", NutritionGate.HighUnsaturatedFat),

            new(759985, "Alfa-linolensyre", NutritionGate.SourceOfAla),
            new(761529, "EPA og DHA", NutritionGate.SourceOfEpaDha),

            // Measured on DHA alone, so a product carrying 761529 on a sum made up mostly of
            // EPA does not carry these.
            new(761449, "DHA", NutritionGate.DhaAlone),
            new(761489, "DHA", NutritionGate.DhaAlone),

            // Both carry a duty to tell pregnant and lactating women that the effect needs
            // 200 mg of DHA on top of the 250 mg of DHA and EPA recommended for adults. That
            // is a sentence for the label, reported through Vilkår for bruk; the part about
            // the food is the 200 mg it has to provide.
            new(755369, "DHA", NutritionGate.DhaDailyIntake),
            new(756569, "DHA", NutritionGate.DhaDailyIntake),

            // The two claims about eating less of something, which is why the heading names
            // the nutrient weighed and not a nutrient added. Both carry a route the
            // calculator cannot follow; see NutritionGate.LowSaturatedFat.
            new(761901, "Mettet fett", NutritionGate.LowSaturatedFat),
            new(761937, "Salt", NutritionGate.LowSodium),

            // The three high-dose omega-3 claims. All three also carry a duty to warn against
            // exceeding 5 g of EPA and DHA a day from supplements, which is a sentence for the
            // label and is reported through Vilkår for bruk.
            new(831109, "DHA", NutritionGate.DhaWithEpaDailyIntake),
            new(833785, "EPA og DHA", NutritionGate.EpaDhaDailyIntake2g),
            new(833485, "EPA og DHA", NutritionGate.EpaDhaDailyIntake3g),

            // The one claim here with two conditions of different kinds: a quantity in the
            // portion and a cross-reference to a nutrition claim. See
            // NutritionGate.CarbsBrainFunction, including what the polyol row would fix.
            new(836625, "Karbohydrater", NutritionGate.CarbsBrainFunction),

            // Six authorised claims on one condition, withheld because no matkategori
            // reaches them. See NutritionGate.SugarsFreeChewingGum for why.
            //
            // 756929 and 756969 state no composition figure of their own beyond being
            // sugar-free chewing gum; the other four cross-reference SUGARS FREE in so many
            // words. 765381 carries one condition more, "each piece of sugar-free chewing gum
            // should contain at least 20 mg of carbamide", which is a figure per piece about
            // an additive that no nutrition table holds, so it would have been reported
            // through Vilkår for bruk rather than checked.
            //
            // new(765261, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
            // new(765305, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
            // new(765345, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
            // new(765381, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
            // new(756929, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
            // new(756969, "Sukkerfri tyggegummi", NutritionGate.SugarsFreeChewingGum),
        };

        private async Task<List<HealthClaimResultDTO>> CheckNutritionGatedHealthClaims(
            NutritionInputDTO n, string foodType, string energyUnit, ProductBasis product,
            ProductDeclarations declarations)
        {
            var results = new List<HealthClaimResultDTO>();

            foreach (var gated in NutritionGatedClaims)
            {
                // The gate decides whether there is a card at all, so by the time one is
                // built the verdict is settled and there is only the amount left to say.
                if (!NutritionGateMet(gated.Gate, foodType, energyUnit, n, product, declarations))
                    continue;

                var euClaim = await _euHealthClaims.GetByIdAsync(gated.PolicyItemId);
                if (euClaim == null) continue;

                string amountDisplay = gated.Gate switch
                {
                    NutritionGate.SourceOfProtein =>
                        FormatNamedPerHundredAmount(n.Protein, "protein", foodType),

                    NutritionGate.HighUnsaturatedFat =>
                        FormatNamedPerHundredAmount(
                            n.MonounsaturatedFat + n.PolyunsaturatedFat, "umettet fett", foodType),

                    NutritionGate.SourceOfAla =>
                        FormatNamedPerHundredAmount(n.AlphaLinolenicAcid, "alfa-linolensyre", foodType),

                    NutritionGate.SourceOfEpaDha =>
                        FormatNamedPerHundredAmount(EpaPlusDha(n), "EPA og DHA", foodType),

                    NutritionGate.DhaAlone =>
                        FormatNamedPerHundredAmount(n.DocosahexaenoicAcid, "DHA", foodType),

                    NutritionGate.DhaDailyIntake =>
                        FormatNamedDailyIntakeAmount(
                            n.DocosahexaenoicAcid, "DHA", product.PortionSize, foodType),

                    // The sum of saturated and trans fat, not saturated fat alone, because
                    // that sum is what LOW SATURATED FAT sets its limit on and so what the
                    // gate weighed. The nutrition row beside it reports the same sum.
                    NutritionGate.LowSaturatedFat =>
                        FormatNamedPerHundredAmount(
                            n.SaturatedFat + n.TransFat, "mettet fett og transfett", foodType),

                    // Salt rather than sodium: the form collects salt, LOW SODIUM/SALT is
                    // stated either way, and SaltPerSodium converts the limit rather than the
                    // declaration.
                    NutritionGate.LowSodium =>
                        FormatNamedPerHundredAmount(n.Salt, "salt", foodType),

                    // DHA alone, since that is the figure its 2 g is measured on. The EPA half
                    // of its condition is a presence test with no figure to report.
                    NutritionGate.DhaWithEpaDailyIntake =>
                        FormatNamedDailyIntakeAmount(
                            n.DocosahexaenoicAcid, "DHA", product.PortionSize, foodType),

                    NutritionGate.EpaDhaDailyIntake2g or NutritionGate.EpaDhaDailyIntake3g =>
                        FormatNamedDailyIntakeAmount(
                            EpaPlusDha(n), "EPA og DHA", product.PortionSize, foodType),

                    // Per portion and not restated as a dagsinntak, because this threshold is
                    // the register's own per-portion figure rather than a day's figure stood
                    // in for. The sugar half of the condition carries no quantity to report.
                    NutritionGate.CarbsBrainFunction =>
                        FormatCarbsBrainFunctionAmount(n, product.PortionSize, foodType),

                    // The figure that carried it is the sugars figure, so that is what the
                    // card shows. Naming it matters more here than anywhere else: under the
                    // heading "Sukkerfri tyggegummi" a bare "0 g per 100 g" would read as
                    // the weight of the gum.
                    //
                    // NutritionGate.SugarsFreeChewingGum =>
                    //     FormatNamedPerHundredAmount(
                    //         n.NaturalSugars + n.AddedSugars, "sukkerarter", foodType),

                    _ => "ikke oppgitt",
                };

                results.Add(BuildEuClaimResult(
                    gated.Nutrient, amountDisplay, MeetsRequirementText, gated.PolicyItemId, euClaim));
            }

            return results;
        }

        // Whether the nutrition claim a card cross-references is met. This is both the
        // verdict and the test for showing the card at all, by the product owner's decision:
        // these nine appear only where they are met.
        //
        // That hides nothing a reader could have used. The cross-reference is the whole of
        // each one's condition, so a failed card would have carried no figure the EFSA
        // næringspåstander section does not already show under the very claim it points at.
        // "Proteinkilde, 11,9 % mot 12 %" is the entire answer, and repeating it as four
        // health cards said nothing further. These also have no opt-in the way a kilde does:
        // every product declares protein, so without this test the panel opened with four
        // refusals nobody had asked for, on a product whose owner may never have been
        // interested in a protein claim.
        //
        // A blank voluntary field reaches the same answer by a different route and is still
        // not read as a zero: the predicates below return false on a null rather than on a
        // measurement. See CalculatorRequestDTO.MonounsaturatedFat.
        //
        // To show them with their reasons instead, test what was declared here (protein > 0,
        // both fatty-acid classes present, the route's figure present) and restore the three
        // formatters commented out below, which are kept for that.
        private static bool NutritionGateMet(
            NutritionGate gate, string foodType, string energyUnit, NutritionInputDTO n,
            ProductBasis product, ProductDeclarations declarations) => gate switch
        {
            NutritionGate.SourceOfProtein => ClaimSourceOfProtein(energyUnit, n),
            NutritionGate.HighUnsaturatedFat => ClaimHighUnsaturatedFat(energyUnit, n),

            // The LOW route of each, which is the only one of the two the form can answer.
            // Both call the nutrition partial's own predicate, so neither card can disagree
            // with the næringspåstand it points at.
            NutritionGate.LowSaturatedFat => ClaimLowSaturatedFat(foodType, energyUnit, n),
            NutritionGate.LowSodium => ClaimLowSodium(n.Salt, product),

            // One route each, not ClaimSourceOfOmega3: the conditions read "at least a source
            // of ALA" and "at least a source of EPA and DHA", so a product carrying the
            // nutrition claim on the other route is not what either one asks for.
            NutritionGate.SourceOfAla =>
                Omega3RouteMet(n.AlphaLinolenicAcid, SourceOfOmega3Ala, EnergyAsKcal(energyUnit, n)),
            NutritionGate.SourceOfEpaDha =>
                Omega3RouteMet(EpaPlusDha(n), SourceOfOmega3EpaDha, EnergyAsKcal(energyUnit, n)),

            // Omega3RouteMet is the shape of the test, not a claim: one figure read per 100 g
            // and per 100 kcal, both of which have to clear. That is word for word what
            // 761449 and 761489 ask of DHA, so the same helper answers it.
            NutritionGate.DhaAlone =>
                Omega3RouteMet(n.DocosahexaenoicAcid, DhaAloneMinG, EnergyAsKcal(energyUnit, n)),

            NutritionGate.DhaDailyIntake =>
                product.PortionSize > 0
                && n.DocosahexaenoicAcid is decimal dha
                && dha * product.PortionSize / 100m >= DhaDailyIntakeMinG,

            // The same per-portion-as-per-day substitution, with EPA's presence as a second
            // term. EPA has to be declared and above zero, not merely declared: a producer who
            // fills the field in as 0 has told us there is none, which is the opposite of
            // "contains DHA in combination with EPA". A blank field is not read as a zero
            // either, by the usual rule for the voluntary fatty-acid figures.
            NutritionGate.DhaWithEpaDailyIntake =>
                product.PortionSize > 0
                && n.DocosahexaenoicAcid is decimal dhaWithEpa
                && n.EicosapentaenoicAcid is decimal epa && epa > 0
                && dhaWithEpa * product.PortionSize / 100m >= DhaWithEpaDailyIntakeMinG,

            NutritionGate.EpaDhaDailyIntake2g =>
                DailyIntakeGateMet(EpaPlusDha(n), product.PortionSize, EpaDhaDailyIntake2MinG),
            NutritionGate.EpaDhaDailyIntake3g =>
                DailyIntakeGateMet(EpaPlusDha(n), product.PortionSize, EpaDhaDailyIntake3MinG),

            // Three terms, and the order matters only for reading: 20 g in the portion, then
            // either of the two sugar routes. Both routes call the nutrition partial's own
            // predicate, so this card cannot disagree with the Lavt sukkerinnhold or Uten
            // tilsatt sukker row beside it, and the declaration one is the producer's answer
            // rather than a reading of the sugar figure. See NutritionGate.CarbsBrainFunction
            // for why n.Carbs is a slight overstatement of what the condition measures.
            NutritionGate.CarbsBrainFunction =>
                product.PortionSize > 0
                && MetabolisableCarbs(n) * product.PortionSize / 100m
                   >= CarbsBrainFunctionMinPerPortionG
                && (ClaimLowSugars(foodType, n.NaturalSugars, n.AddedSugars)
                    || ClaimWithNoAddedSugars(declarations)),

            // NutritionGate.SugarsFreeChewingGum =>
            //     product.IsChewingGum && ClaimSugarsFree(n.NaturalSugars, n.AddedSugars),

            _ => false,
        };

        // "Carbohydrates which are metabolised by humans, excluding polyols": the declared
        // Karbohydrat less the declared polyols.
        //
        // The subtraction is a definition and not an estimate. Annex I to Regulation (EU) No
        // 1169/2011 defines carbohydrate as "any carbohydrate which is metabolised by humans,
        // and includes polyols", so the figure on the label already contains them and 836625
        // carves them back out in as many words. Sukkerarter is unaffected either way: the
        // same Annex defines sugars as the mono- and disaccharides "but excludes polyols",
        // which is what the Sukkerarter field's own help text already tells the user.
        //
        // Clamped at zero rather than trusted, since a declared polyol figure above the
        // declared carbohydrate is a contradiction in the inputs, not a negative quantity of
        // food.
        //
        // Only 836625 reads this. BetaGlucanMealRatio and CarbsRatioThreshold take n.Carbs as
        // "available carbohydrates", and they are left alone on purpose: their conditions say
        // nothing about polyols, and what "available" ought to mean is a separate question
        // from this one.
        private static decimal MetabolisableCarbs(NutritionInputDTO n) =>
            Math.Max(0m, n.Carbs - (n.Polyols ?? 0m));

        // "Food which provides a daily intake of X", with the portion standing in for the day.
        // The same substitution 755405 and the DailyIntakeThreshold kilder rest on, and it is
        // named as an assumption on the card rather than buried here: see
        // FormatNamedDailyIntakeAmount.
        //
        // A null amount is a figure the producer never declared and is not read as a zero, so
        // the claim is withheld rather than refused. A missing portion size withholds it too,
        // since without one there is no day to convert to.
        private static bool DailyIntakeGateMet(
            decimal? amountPer100, decimal portionSize, decimal minPerDay) =>
            portionSize > 0
            && amountPer100 is decimal a
            && a * portionSize / 100m >= minPerDay;

        // The amount a gated card shows is the figure its own gate weighed, and it is named,
        // because the substance a claim is about is not always the one its condition
        // measures: 763849 is a claim about oleic acid whose condition is about unsaturated
        // fat as a whole, so a bare "30 g per 100 g" under the heading "Oljesyre" would read
        // as 30 g of oleic acid. AddOmega3Claim names its route's substance for the same
        // reason.
        private static string FormatNamedPerHundredAmount(
            decimal? amount, string substance, string foodType) =>
            amount is decimal a
                ? $"{FormatNo(a)} g {substance} {PerHundredLabel(foodType)}"
                : "ikke oppgitt";

        // The plain version of the line above, for a gate whose figure the register states
        // per portion outright with nothing to deduct from it. 836625 was its only caller for
        // one day and now needs the polyol-aware one, so it has none; commented out rather
        // than deleted, because the next per-portion gate is the one that wants it and this
        // also records that a per-portion figure gets no "regnet som dagsinntak" note.
        //
        // private static string FormatNamedPortionAmount(
        //     decimal? amountPer100, string substance, decimal portionSize, string foodType)
        // {
        //     if (amountPer100 is not decimal a) return "ikke oppgitt";
        //     if (portionSize <= 0) return FormatNamedPerHundredAmount(a, substance, foodType);
        //     return $"{FormatNo(Math.Round(a * portionSize / 100m, 3))} g {substance} per porsjon";
        // }

        // The carbohydrate figure 836625 weighed, which is not the one in the nutrition table
        // whenever polyols were declared. The deduction is named in that case, because a reader
        // checking the card against the table would otherwise find two numbers and no reason
        // for the difference. Nothing is named when no polyols were declared, since then the
        // two figures are the same number and saying so would only invite doubt about it.
        private static string FormatCarbsBrainFunctionAmount(
            NutritionInputDTO n, decimal portionSize, string foodType)
        {
            decimal metabolisable = MetabolisableCarbs(n);
            if (portionSize <= 0)
                return FormatNamedPerHundredAmount(metabolisable, "karbohydrater", foodType);

            string line = $"{FormatNo(Math.Round(metabolisable * portionSize / 100m, 3))} g " +
                          "karbohydrater per porsjon";
            return n.Polyols is decimal polyols && polyols > 0
                ? $"{line}, utenom {FormatNo(Math.Round(polyols * portionSize / 100m, 3))} g polyoler"
                : line;
        }

        // The same line for a gate whose figure the register states per day, naming the
        // substitution the way FormatDailyIntakeAmount does for the kilde substances.
        private static string FormatNamedDailyIntakeAmount(
            decimal? amountPer100, string substance, decimal portionSize, string foodType)
        {
            if (amountPer100 is not decimal a) return "ikke oppgitt";
            if (portionSize <= 0) return FormatNamedPerHundredAmount(a, substance, foodType);
            return $"{FormatNo(Math.Round(a * portionSize / 100m, 3))} g {substance} " +
                   "per porsjon, regnet som dagsinntak";
        }

        // The three "why it fell short" formatters, commented out with the decision above
        // rather than deleted, because restoring that decision is restoring these.
        //
        // They are left here and not left live-but-unused on purpose: a method that reads as
        // though some card somewhere prints its wording, when no card can, is the kind of
        // thing the next reader spends an afternoon on. Each one still states the rule it
        // was written from, so they are also the record of what these conditions are.
        //
        // // "Food which is at least a source of protein". A miss reports the share of the
        // // energy, not the grams, because the share is what the condition is about: "5 g
        // // protein" beside "12" would quote a threshold the Annex sets nowhere.
        // private static string FormatSourceOfProteinGate(string energyUnit, NutritionInputDTO n)
        // {
        //     if (ClaimSourceOfProtein(energyUnit, n)) return MeetsRequirementText;
        //
        //     bool useKcal = energyUnit == "energikcal";
        //     decimal energy = useKcal ? n.EnergyKcal : n.EnergyKj;
        //     if (energy <= 0) return $"{CannotComputePrefix} (energi mangler)";
        //
        //     decimal share = RoundAwayFromThreshold(
        //         n.Protein * (useKcal ? KcalPerGramProtein : KjPerGramProtein) * 100m / energy,
        //         "≥", 1);
        //
        //     return $"Oppfyller ikke gitt krav (trenger minst {FormatNo(SourceOfProteinEnergyShare)} % " +
        //            $"av energien fra protein, produktet har {FormatNo(share)} %)";
        // }
        //
        // // "Food which is high in unsaturated fatty acids", which is two conditions holding
        // // at once, so a miss names whichever one refused it. Same choice
        // // AddUnsaturatedFatClaim makes for the nutrition row, and made the same way round:
        // // the share of fatty acids is reported unless it cleared, which leaves the energy
        // // share as what refused it.
        // private static string FormatHighUnsaturatedFatGate(string energyUnit, NutritionInputDTO n)
        // {
        //     if (ClaimHighUnsaturatedFat(energyUnit, n)) return MeetsRequirementText;
        //
        //     if (n.MonounsaturatedFat + n.PolyunsaturatedFat is not decimal g
        //         || DeclaredFattyAcids(n) is not decimal total || total <= 0)
        //         return $"{CannotComputePrefix} (fettsyrene er ikke oppgitt)";
        //
        //     // Both branches compare the unrounded share and print the rounded one, so the
        //     // figure can never land on the wrong side of the limit it is printed beside.
        //     if (g * 100m / total < HighUnsaturatedFattyAcidShare)
        //         return $"Oppfyller ikke gitt krav (trenger minst {FormatNo(HighUnsaturatedFattyAcidShare)} % " +
        //                $"av fettsyrene fra umettet fett, produktet har " +
        //                $"{FormatNo(RoundAwayFromThreshold(g * 100m / total, "≥", 1))} %)";
        //
        //     bool useKcal = energyUnit == "energikcal";
        //     decimal energy = useKcal ? n.EnergyKcal : n.EnergyKj;
        //     if (energy <= 0) return $"{CannotComputePrefix} (energi mangler)";
        //
        //     decimal classEnergy = g * (useKcal ? KcalPerGramFat : KjPerGramFat);
        //     return $"Oppfyller ikke gitt krav (trenger mer enn {FormatNo(HighFatEnergyShare)} % " +
        //            $"av energien fra umettet fett, produktet har " +
        //            $"{FormatNo(RoundAwayFromThreshold(classEnergy * 100m / energy, "≥", 2))} %)";
        // }
        //
        // // One route of SOURCE OF OMEGA 3 FATTY ACIDS, whose figure the Annex states once
        // // and reads twice, per 100 g and per 100 kcal, both of which have to clear. A miss
        // // names the basis that refused it: the per-100 g one where the grams fell short,
        // // the energy one where they cleared and the claim still failed.
        // private static string FormatOmega3RouteGate(
        //     decimal? amount, decimal limit, string substance,
        //     string foodType, string energyUnit, NutritionInputDTO n)
        // {
        //     decimal kcal = EnergyAsKcal(energyUnit, n);
        //     if (Omega3RouteMet(amount, limit, kcal)) return MeetsRequirementText;
        //
        //     if (amount is not decimal a) return $"{CannotComputePrefix} ({substance} er ikke oppgitt)";
        //
        //     if (a < limit)
        //         return $"Oppfyller ikke gitt krav (trenger minst {FormatNo(limit)} g {substance} " +
        //                $"{PerHundredLabel(foodType)}, produktet har {FormatNo(a)} g)";
        //
        //     if (kcal <= 0) return $"{CannotComputePrefix} (energi mangler)";
        //
        //     // Five decimals for the same reason AddOmega3Claim uses them: the smallest
        //     // limit here is 0,04 g, and two decimals would floor a near miss onto the
        //     // threshold and print a figure that argues against the verdict beside it.
        //     return $"Oppfyller ikke gitt krav (trenger minst {FormatNo(limit)} g {substance} per 100 kcal, " +
        //            $"produktet har {FormatNo(RoundAwayFromThreshold(a * 100m / kcal, "≥", 5))} g)";
        // }
    }
}
