using Backend.DTO;

namespace Backend.Services
{
    // Nokkelhullet: the per-category composition limits and the verdict built from them.
    public partial class CalculatorService
    {
        // Nøkkelhullet thresholds per category (all values per 100 g/ml)
        // null = no requirement for that nutrient in this category
        private record CategoryThreshold(
            decimal? MaxFat = null,
            decimal? MaxSatFat = null,
            decimal? DynamicSatFatFraction = null,
            decimal? MaxTotalSugars = null,  // sukkerarter = NaturalSugars + AddedSugars
            decimal? MaxAddedSugars = null,
            decimal? MinFibre = null,
            decimal? MaxSalt = null,
            // True where the category writes its fat rules about *tilsatt* fett rather than
            // total fat (Kategori1 is the only one). The nutrition declaration only gives
            // total fat, so that is what gets compared, and the requirement carries a note
            // saying so. Stricter than the rule, which is the safe direction, but it can
            // refuse a product whose fat is naturally present.
            bool AddedFatOnly = false
        );

        // Categories with no numeric thresholds — always pass if inputs are provided
        private static readonly HashSet<string> AlwaysPassCategories = new() { "Kategori0", "Kategori2", "Kategori21" };

        private static readonly Dictionary<string, CategoryThreshold> NokkelhulletThresholds = new()
        {
            // Cat 1–10
            // Kategori1: tilsatt fett <= 3; satFat <= 20% of tilsatt fett (dynamic); tilsatte sukkerarter <= 1; salt <= 0.5
            ["Kategori1"]   = new(MaxFat: 3m,    DynamicSatFatFraction: 0.2m,  MaxAddedSugars: 1m,  MaxSalt: 0.5m, AddedFatOnly: true),
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

        // ── Nøkkelhullet ────────────────────────────────────────────────────────

        // The per-requirement breakdown. This is the assessment itself, not a description of
        // it: HasNokkelhullet is the AND of Passed across what this returns, so the verdict
        // and the reasons behind it can't drift apart.
        //
        // Empty for the always-pass categories and for a category with no thresholds, which
        // is why CheckNokkelhullet still distinguishes those two cases itself rather than
        // reading an empty list as "everything passed".
        private static List<NokkelhulletRequirementDTO> BuildNokkelhulletRequirements(
            string category, NutritionInputDTO n)
        {
            var requirements = new List<NokkelhulletRequirementDTO>();
            if (!NokkelhulletThresholds.TryGetValue(category, out var t))
                return requirements;

            string? fatNote = t.AddedFatOnly
                ? "Kravet i Nøkkelhullforskriften gjelder tilsatt fett. Kalkulatoren sammenligner "
                + "med totalt innhold av fett, som inkluderer både naturlig forekommende og tilsatt fett."
                : null;

            if (t.MaxFat.HasValue)
            {
                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "maxFat", Label = "Fett", ActualValue = n.Fat,
                    Comparator = "≤", ThresholdValue = t.MaxFat.Value,
                    ActualUnit = "g/100 g", ThresholdUnit = "g/100 g",
                    Passed = n.Fat <= t.MaxFat.Value, Note = fatNote,
                });
            }

            // No category defines both, so these are genuinely alternatives rather than two
            // rules that could both apply.
            if (t.MaxSatFat.HasValue)
            {
                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "maxSatFat", Label = "Mettede fettsyrer", ActualValue = n.SaturatedFat,
                    Comparator = "≤", ThresholdValue = t.MaxSatFat.Value,
                    ActualUnit = "g/100 g", ThresholdUnit = "g/100 g",
                    Passed = n.SaturatedFat <= t.MaxSatFat.Value,
                });
            }
            else if (t.DynamicSatFatFraction.HasValue)
            {
                decimal fraction = t.DynamicSatFatFraction.Value;
                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "dynamicSatFatFraction", Label = "Mettede fettsyrer",
                    ActualValue = n.SaturatedFat, Comparator = "≤", ActualUnit = "g/100 g",
                    // The limit moves with the fat content, so it's computed per product and
                    // the unit says what the percentage is of.
                    ThresholdValue = Math.Round(n.Fat * fraction, 2),
                    ThresholdUnit = $"g/100 g ({FormatNo(fraction * 100m)} % av fett)",
                    Passed = n.SaturatedFat <= n.Fat * fraction,
                    Note = t.AddedFatOnly
                        ? "Kravet i Nøkkelhullforskriften regner prosentandelen av tilsatt fett. "
                        + "Kalkulatoren regner den av totalt innhold av fett."
                        : null,
                });
            }

            // NaturalSugars is always 0 from the frontend (single "Sukkerarter" field, no
            // natural/added split), so AddedSugars carries the full total. Checking that
            // total against both caps is the same as checking it against the stricter one,
            // which is what gets reported as the single Sukkerarter row.
            if (t.MaxTotalSugars.HasValue || t.MaxAddedSugars.HasValue)
            {
                decimal sugars = n.NaturalSugars + n.AddedSugars;
                decimal threshold = Math.Min(
                    t.MaxTotalSugars ?? decimal.MaxValue,
                    t.MaxAddedSugars ?? decimal.MaxValue);

                // The rule caps *tilsatte* sukkerarter for some categories while the form
                // collects the total, per Mattilsynet's advice to keep "sukkerarter" as the
                // single term. The note says what the rule covers and what was compared,
                // without drawing a conclusion. That call belongs to the reader.
                bool cappedOnAddedOnly = t.MaxAddedSugars.HasValue
                    && (!t.MaxTotalSugars.HasValue || t.MaxAddedSugars.Value < t.MaxTotalSugars.Value);

                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "maxSukkerarter", Label = "Sukkerarter", ActualValue = sugars,
                    Comparator = "≤", ThresholdValue = threshold,
                    ActualUnit = "g/100 g", ThresholdUnit = "g/100 g",
                    Passed = sugars <= threshold,
                    Note = cappedOnAddedOnly
                        ? $"Kravet i Nøkkelhullforskriften gjelder tilsatte sukkerarter (høyst "
                        + $"{FormatNo(t.MaxAddedSugars!.Value)} g/100 g). Kalkulatoren sammenligner med "
                        + "totalt innhold av sukkerarter, som inkluderer både naturlig forekommende "
                        + "og tilsatte sukkerarter."
                        : null,
                });
            }

            if (t.MinFibre.HasValue)
            {
                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "minFibre", Label = "Kostfiber", ActualValue = n.Fibre,
                    Comparator = "≥", ThresholdValue = t.MinFibre.Value,
                    ActualUnit = "g/100 g", ThresholdUnit = "g/100 g",
                    Passed = n.Fibre >= t.MinFibre.Value,
                });
            }

            if (t.MaxSalt.HasValue)
            {
                requirements.Add(new NokkelhulletRequirementDTO
                {
                    Key = "maxSalt", Label = "Salt", ActualValue = n.Salt,
                    Comparator = "≤", ThresholdValue = t.MaxSalt.Value,
                    ActualUnit = "g/100 g", ThresholdUnit = "g/100 g",
                    Passed = n.Salt <= t.MaxSalt.Value,
                });
            }

            foreach (var r in requirements) r.Explanation = RequirementExplanation(r);

            return requirements;
        }

        // The Norwegian sentence shown with a Nøkkelhullet result, the counterpart of
        // EfsaClaimCopy. Built from the figures rather than stored as fixed copy, because the
        // limit is per category and one of them (the dynamic saturated-fat rule) moves with
        // the product's own fat content.
        private static string RequirementExplanation(NokkelhulletRequirementDTO r) =>
            $"Produktet inneholder {FormatNo(r.ActualValue)} {r.ActualUnit}, "
            + (r.Passed ? "som oppfyller kravet om" : "men kravet er")
            + $" {(r.Comparator == "≤" ? "høyst" : "minst")} "
            + $"{FormatNo(r.ThresholdValue)} {r.ThresholdUnit}.";

        private static bool? CheckNokkelhullet(
            string category, NutritionInputDTO n, List<NokkelhulletRequirementDTO> requirements)
        {
            if (n.EnergyKcal == 0 && n.EnergyKj == 0)
                return null;

            if (AlwaysPassCategories.Contains(category))
                return true;

            // An unknown category has no rules to judge against, which is not the same as
            // having no unmet rules, so it stays null rather than falling through to All().
            if (!NokkelhulletThresholds.ContainsKey(category))
                return null;

            return requirements.All(r => r.Passed);
        }
    }
}
