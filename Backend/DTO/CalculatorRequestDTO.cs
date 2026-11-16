namespace Backend.DTO
{
    public class CalculatorRequestDTO
    {
        // e.g. "Kategori1", "Kategori6", "Melk11a", "Kategori24b2"
        public string Category { get; set; } = string.Empty;

        // "solid" or "liquid"
        public string FoodType { get; set; } = string.Empty;

        // "energikcal" or "energikj"
        public string EnergyUnit { get; set; } = string.Empty;

        public NutritionInputDTO Nutrition { get; set; } = new();

        // Portion size of the product (g/ml) — used by claims whose condition needs a
        // "quantified portion" (e.g. the Beta-glucans post-meal-glucose claim). One value
        // for the whole product, since a real serving includes everything in it at once.
        public decimal PortionSize { get; set; }

        // Which of the Annex's product-type carve-outs this product falls under, or empty
        // for the ordinary case. One field rather than a flag each, because the carve-outs
        // are mutually exclusive: nothing is both a bordsøtningsmiddel and a drikkevann.
        //
        //   ""                  an ordinary næringsmiddel, every claim read as written
        //   "tableTopSweetener" LOW ENERGY and ENERGY-FREE move to their per-portion limits
        //   "drinkingWater"     LOW SODIUM drops to 2 mg natrium/100 ml, and VERY LOW
        //                       SODIUM is withheld: the Annex forbids it outright for waters
        //   "semiSkimmedMilk"   LOW FAT rises to 1,8 g/100 ml
        //
        // None of these is derivable from what the form already knows. The matkategori list
        // is the Nøkkelhullet taxonomy, which has no water at all and does not separate
        // lettmelk from helmelk, and foodType only says fast or flytende, which would sweep
        // in milk, juice and soup alongside water. So it is asked for.
        //
        // For a bordsøtningsmiddel, PortionSize above is read as the amount with "equivalent
        // sweetening properties to 6 g of sucrose", which is what the form's own label asks
        // for once this is set. Sweetening power is a sensory property and cannot be derived
        // from a nutrition table, so the figure is the producer's declaration, like every
        // other figure here, and the claim text says so rather than presenting it as checked.
        //
        // A "chewingGum" value was added for six sugar-free chewing gum health claims and
        // then withheld: Nøkkelhullet has no category for gum, so nothing could reach them.
        // See NutritionGate.SugarsFreeChewingGum.
        public string ProductType { get; set; } = string.Empty;

        // The two claims in the Annex whose condition is about what went into the product
        // rather than about what came out of it. A nutrition table only ever describes what
        // came out, so neither can be derived from anything else on this form, and the
        // producer is asked instead.
        //
        // WITH NO ADDED SUGARS requires that the product "does not contain any added mono- or
        // disaccharides or any other food used for its sweetening properties". That last
        // clause is why no nutrition table can settle it: concentrated fruit juice, honey,
        // syrup and malt extract sweeten a product and then appear on the Sukkerarter row as
        // ordinary sugars, indistinguishable from the sugars of the fruit or the milk. A
        // separate "tilsatt sukker" field would not settle it either, since the producer
        // would be the one filling that in too.
        //
        // NO ADDED SODIUM/SALT asks the same of salt and then adds a ceiling of 0,12 g
        // natrium per 100 g or 100 ml on top of it. Only the first half is declared here;
        // the ceiling is read off the Salt figure the form already collects, so a tick alone
        // does not carry that claim.
        //
        // Handled the way the fullkorn confirmation is, and reported the same way: the result
        // states that the premise was confirmed rather than calculated, so nobody is left
        // thinking the calculator inspected a recipe it has never seen.
        public bool NoAddedSugarsDeclared { get; set; }
        public bool NoAddedSaltDeclared { get; set; }

        // Whether the energy field was filled in at all, which 0 cannot answer. The
        // calculator withholds every claim when no energy was given, because an empty form
        // must not produce verdicts; but 0 kcal is a real and common measurement, and water,
        // a sugar-free drink and a sweetener in drops all declare it. Reading "blank" off a
        // zero withheld all fifteen claims from exactly the products ENERGY-FREE is for.
        //
        // The same mistake, in the other direction, once let a hidden Sukkerarter field be
        // sent as a measured 0 and grant "Sukkerfri" to milk. A number and the fact that
        // someone entered it are two different things, and only the client knows the second.
        public bool EnergyEntered { get; set; }

        public List<HealthClaimInputDTO> Vitamins { get; set; } = new();
        public List<HealthClaimInputDTO> Minerals { get; set; } = new();
        public List<OtherClaimInputDTO> Others { get; set; } = new();
    }

    public class NutritionInputDTO
    {
        public decimal EnergyKcal { get; set; }
        public decimal EnergyKj { get; set; }
        public decimal Fat { get; set; }
        public decimal SaturatedFat { get; set; }
        public decimal TransFat { get; set; }

        // Used as total carbohydrates, or as total sugars depending on category
        public decimal Carbs { get; set; }

        public decimal NaturalSugars { get; set; }
        public decimal AddedSugars { get; set; }
        public decimal Fibre { get; set; }
        public decimal Protein { get; set; }

        // Total salt (natural + added)
        public decimal Salt { get; set; }

        // The portion of Salt that was added during production — used to verify
        // "uten tilsatt natrium/salt" actually means nothing was added, not just that
        // the total happens to be low.
        public decimal AddedSalt { get; set; }

        // The fatty-acid breakdown the five unsaturated-fat claims read. Nullable, and the
        // only nutrition figures on this form that are: Regulation (EU) No 1169/2011 makes
        // fett and mettede fettsyrer mandatory on a label but leaves enumettede,
        // flerumettede and the omega-3 figures voluntary, so most producers simply do not
        // have them. Null means "not declared", which is a different answer from 0: a
        // product with no omega-3 figure on its label is not a product with no omega-3 in
        // it, and a 0 would let the calculator refuse a claim nobody asked it about.
        //
        // The claims that read them are withheld rather than failed when they are null.
        // This is the same distinction EnergyEntered draws, and the same mistake that once
        // sent a hidden Sukkerarter field as a measured 0 and granted "Sukkerfri" to milk.
        //
        // Grams per 100 g, like every other nutrient here. The Annex states the two
        // omega-3 limits in milligrams, 40 mg and 80 mg, and the thresholds below are
        // written as the gram figures those come to; the form asks in grams so a column of
        // nutrition fields has one unit all the way down and a label read in grams cannot
        // be typed into a box that silently means milligrams.
        //
        // The Annex asks for "the sum of eicosapentaenoic acid and docosahexaenoic acid",
        // but the two are declared separately on a label, so they are asked for separately
        // and added here rather than making the producer do the arithmetic. See
        // CalculatorService.EpaPlusDha for what a blank one of the pair means.
        public decimal? MonounsaturatedFat { get; set; }
        public decimal? PolyunsaturatedFat { get; set; }
        public decimal? AlphaLinolenicAcid { get; set; }
        public decimal? EicosapentaenoicAcid { get; set; }
        public decimal? DocosahexaenoicAcid { get; set; }

        // Sugar alcohols, declared under Karbohydrat on a label and read by 836625, whose
        // condition is about "carbohydrates which are metabolised by humans, excluding
        // polyols".
        //
        // Voluntary under Article 30(2) of Regulation (EU) No 1169/2011, like the fatty-acid
        // breakdown above, so nullable for the same reason. What differs is what a blank
        // means. A blank enumettede withholds the claims that read it, because those claims
        // are about unsaturated fat and nothing can be said about a figure nobody gave. A
        // blank here is read as none, because this is a deduction from a figure that *was*
        // given, and withholding on it would take 836625 away from every bread and pasta
        // whose producer simply had no polyols to declare.
        //
        // That is not the fabricated zero this project was bitten by. The field is shown
        // whenever the claim is in scope, so a blank is the producer's answer; the
        // over-claim came from a Sukkerarter field that was hidden and sent 0 anyway. See
        // CalculatorService.MetabolisableCarbs.
        public decimal? Polyols { get; set; }

        // Used for the "resistant starch" EFSA health claim, which requires resistant
        // starch to be at least 14% of total starch — not derivable from Carbs alone.
        public decimal TotalStarch { get; set; }
        public decimal ResistantStarch { get; set; }
    }

    public class HealthClaimInputDTO
    {
        // Must match a "nutrient" value in health_claims.json
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }

        // "mg" or "µg" — µg values are auto-converted to mg
        public string Unit { get; set; } = "mg";
    }

    public class OtherClaimInputDTO
    {
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
