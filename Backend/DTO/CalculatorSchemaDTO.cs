namespace Backend.DTO
{
    // What the calculator form needs to know about a category before anything has been
    // entered: which inputs to show, which claims will be assessed, and the thresholds the
    // form highlights against while the user types.
    //
    // This exists because all of that is rule knowledge, and rule knowledge lives here. The
    // frontend used to hold its own copies (EFSA_CLAIMS_BY_CATEGORY, EFSA_CLAIM_FIELDS,
    // kategorier, nokkelhulletThresholds), which is the same duplication that let a hidden
    // sugar field be sent as a measured 0 and grant "Sukkerfri" to milk.
    public class CalculatorSchemaDTO
    {
        // Nutrition-table field keys to render, in the form's own order. A field is included
        // when a Nøkkelhullet rule or an offered EFSA claim actually reads it, so nothing is
        // asked for that no rule will look at, and nothing a rule reads goes unasked.
        public List<string> Fields { get; set; } = new();

        // The subset of Fields that Nøkkelhullet governs for this category. The form marks
        // these with the keyhole icon.
        public List<string> NokkelhulletFields { get; set; } = new();

        // EFSA nutrition claim keys offered for this category, per the client's mapping.
        public List<string> Claims { get; set; } = new();

        // Which nutrition fields each offered claim reads, for the "Produktet inneholder ..."
        // line under each claim. Keyed by claim key; energy claims map to an empty list since
        // energy isn't a nutrition-table field.
        public Dictionary<string, List<string>> ClaimFields { get; set; } = new();

        // The category's Nøkkelhullet limits, or null where it has none. Sent so the form can
        // flag a field red as it is typed, before any calculation has been run. It is the same
        // table the verdict is computed from, so the highlight and the result agree.
        public NokkelhulletThresholdDTO? Thresholds { get; set; }

        // The substances selectable in "Kilde til Annet". Which ones exist, what unit each is
        // measured in and whether it needs a portion size are all properties of the claim
        // registries, so they come from here rather than a hand-kept list in the picker.
        public List<KildeOptionDTO> Kilder { get; set; } = new();
    }

    public class KildeOptionDTO
    {
        // The name sent back on the request. Matches the registry key, which is the English
        // name the EU register uses.
        public string Value { get; set; } = string.Empty;

        // Norwegian display name.
        public string Label { get; set; } = string.Empty;

        // "g" for the fibre sources, "mg" or "µg" for a mineral or vitamin. The claim
        // conditions state their limits in these units.
        public string Unit { get; set; } = "g";

        // "vitamin", "mineral" or "other", which decides the request list the entry goes into.
        public string Kind { get; set; } = "other";

        // True where the substance is a subset of Kostfiber, so the picker can gate it on
        // the Kostfiber field and check the running total against it.
        public bool RequiresKostfiber { get; set; }

        // True where at least one of its claims states a threshold per quantified portion, so
        // the picker can say up front that Porsjonsstørrelse will be needed.
        public bool RequiresPortionSize { get; set; }
    }

    public class NokkelhulletThresholdDTO
    {
        public decimal? MaxFat { get; set; }
        public decimal? MaxSatFat { get; set; }

        // A share of the product's own fat rather than a fixed number, e.g. 0,2 for "høyst
        // 20 % av fettinnholdet".
        public decimal? DynamicSatFatFraction { get; set; }

        public decimal? MaxTotalSugars { get; set; }
        public decimal? MaxAddedSugars { get; set; }
        public decimal? MinFibre { get; set; }
        public decimal? MaxSalt { get; set; }
    }
}
