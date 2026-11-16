import type {
  CalculatorRequestPayload,
  CalculatorSchema,
} from "../../services/calculatorService";

// Nutrition-table field values, as held by the form (always strings — they come
// straight from <input> elements) and passed down to the result views afterwards.
export type NutritionValues = Record<string, string>;

interface NutritionFieldDef {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  info?: string;
  // Shown like any other field but not required before Beregn. Only the four fatty-acid
  // figures are: Regulation (EU) No 1169/2011 makes fett and mettede fettsyrer mandatory on
  // a label and leaves these voluntary, so most producers simply do not have them. Blank
  // sends null rather than 0, and the claims that read them are withheld rather than
  // failed. See CalculatorRequestDTO.MonounsaturatedFat.
  optional?: boolean;
}

export const NUTRITION_FIELDS: NutritionFieldDef[] = [
  { key: "fett", label: "Fett", unit: "g", placeholder: "f.eks. 5" },
  { key: "mettede", label: "Mettede fettsyrer", unit: "g", placeholder: "f.eks. 2" },
  { key: "transfett", label: "Transfett", unit: "g", placeholder: "f.eks. 0" },
  // Spelled out rather than lettered. ALA, EPA and DHA are what a fatty-acid table calls
  // them, but the person filling this in is reading a label, where the names are written
  // out, and an acronym they have to decode is a worse label than a long word they can
  // match by eye.
  //
  // None of the five carries an ⓘ. Their names say what they are, and with every field on
  // the form in grams there is no unit left to explain.
  {
    key: "enumettede",
    label: "Enumettede fettsyrer",
    unit: "g",
    placeholder: "f.eks. 12",
    optional: true,
  },
  {
    key: "flerumettede",
    label: "Flerumettede fettsyrer",
    unit: "g",
    placeholder: "f.eks. 8",
    optional: true,
  },
  {
    key: "alfalinolensyre",
    label: "Alfa-linolensyre",
    unit: "g",
    placeholder: "f.eks. 1,2",
    optional: true,
  },
  // Asked for one at a time, because that is how a label declares them, and added together
  // by the calculator: the Annex sets its limit on "the sum of" the two, and making the
  // producer do that addition is asking them to do arithmetic the tool exists to do.
  {
    key: "eikosapentaensyre",
    label: "Eikosapentaensyre",
    unit: "g",
    placeholder: "f.eks. 0,15",
    optional: true,
  },
  {
    key: "dokosaheksaensyre",
    label: "Dokosaheksaensyre",
    unit: "g",
    placeholder: "f.eks. 0,1",
    optional: true,
  },
  { key: "karbohydrat", label: "Karbohydrat", unit: "g", placeholder: "f.eks. 20" },
  {
    key: "sukkerarter",
    label: "Sukkerarter",
    unit: "g",
    placeholder: "f.eks. 8",
    // Mattilsynet's wording: the nutrition declaration doesn't separate the two,
    // so the field has to say outright that it covers both.
    info: "Sukkerarter er alle mono- og disakkarider i produktet, unntatt polyoler, slik det oppgis i næringsdeklarasjonen. Tallet omfatter både naturlig forekommende og tilsatte sukkerarter.",
  },
  // Voluntary under Article 30(2) of Regulation (EU) No 1169/2011, and sitting under
  // Sukkerarter the way a nutrition declaration orders it. Read by one claim, 836625, whose
  // condition is about carbohydrate "excluding polyols" where the Karbohydrat figure above
  // includes them. Blank is read as none rather than withholding that claim, which is why the
  // field is shown rather than inferred. See CalculatorRequestDTO.Polyols.
  {
    key: "polyoler",
    label: "Polyoler",
    unit: "g",
    placeholder: "f.eks. 0",
    optional: true,
    info: "Polyoler er sukkeralkoholer som isomalt, maltitol, sorbitol og xylitol. De regnes med i Karbohydrat i næringsdeklarasjonen, men ikke i Sukkerarter. Feltet er frivillig: står det tomt, regnes produktet som uten polyoler.",
  },
  { key: "kostfiber", label: "Kostfiber", unit: "g", placeholder: "f.eks. 3" },
  { key: "protein", label: "Protein", unit: "g", placeholder: "f.eks. 8" },
  { key: "salt", label: "Salt", unit: "g", placeholder: "f.eks. 0,7" },
];

export const EMPTY_NUTRITION: NutritionValues = {
  energikj: "",
  energikcal: "",
  fett: "",
  mettede: "",
  transfett: "",
  enumettede: "",
  flerumettede: "",
  alfalinolensyre: "",
  eikosapentaensyre: "",
  dokosaheksaensyre: "",
  karbohydrat: "",
  sukkerarter: "",
  polyoler: "",
  kostfiber: "",
  protein: "",
  salt: "",
};

// Which fields to show, which of them Nøkkelhullet governs, and whether one is currently
// over or under its limit: all three used to be worked out here from local copies of the
// rules. They come from the schema now, so the form asks the same source that will judge the
// result. See CalculatorService.BuildSchema.

// The optional chaining is deliberate. Every caller is a .jsx component, which TypeScript
// doesn't check, so a wrong argument here reaches runtime: passing the category string
// instead of the schema took the whole form down with "Cannot read properties of undefined".
// Treating a malformed schema as "no fields" degrades to an empty form instead.
export const isNokkelhulletField = (key: string, schema: CalculatorSchema): boolean =>
  schema?.nokkelhulletFields?.includes(key) ?? false;

export const isFieldRelevant = (key: string, schema: CalculatorSchema): boolean =>
  schema?.fields?.includes(key) ?? false;

// Live feedback while typing, before any calculation has run, so it needs the limits rather
// than a verdict. They arrive on the schema, from the same table the backend judges against.
export const isFieldFailing = (
  key: string,
  schema: CalculatorSchema,
  nutrition: NutritionValues,
): boolean => {
  const t = schema?.thresholds;
  if (!t) return false;
  const val = Number(nutrition[key]);
  if (nutrition[key] === "" || isNaN(val)) return false;

  switch (key) {
    case "fett":
      return t.maxFat != null && val > t.maxFat;
    case "mettede": {
      const fat = Number(nutrition.fett) || 0;
      return (
        (t.maxSatFat != null && val > t.maxSatFat) ||
        (t.dynamicSatFatFraction != null && val > fat * t.dynamicSatFatFraction)
      );
    }
    // One field for total sugars, checked against both caps where a category defines them.
    // Stricter than the rule for added-sugar-only categories, which is the safe direction:
    // it can refuse a claim, never grant one falsely.
    case "sukkerarter":
      return (
        (t.maxTotalSugars != null && val > t.maxTotalSugars) ||
        (t.maxAddedSugars != null && val > t.maxAddedSugars)
      );
    case "kostfiber":
      return t.minFibre != null && val < t.minFibre;
    case "salt":
      return t.maxSalt != null && val > t.maxSalt;
    default:
      return false;
  }
};

const NOKKELHULLET_FIELD_LABELS: Record<string, string> = {
  fett: "fett",
  mettede: "mettede fettsyrer",
  sukkerarter: "sukkerarter",
  kostfiber: "kostfiber",
  salt: "salt",
};

// Norway uses a comma as the decimal separator (e.g. "0,7" not "0.7") — every number shown
// to the user goes through this instead of raw interpolation, which always uses ".".
export const formatNoNumber = (value: number): string =>
  value.toString().replace(".", ",");

// Nutrition inputs are type="text" (not type="number") specifically so a typed comma isn't
// silently rejected by the browser — native number inputs only accept "." as the decimal
// separator in most browser locales regardless of the page's own language. Rejects anything
// that isn't a plausible in-progress decimal (digits with at most one comma/period) and
// normalizes the separator to "." so every existing Number(nutrition[key]) call downstream
// keeps working unchanged.
export const sanitizeDecimalInput = (raw: string): string | null =>
  /^\d*[.,]?\d*$/.test(raw) ? raw.replace(",", ".") : null;

// The mirror of sanitizeDecimalInput's normalization, for display: fields are stored with
// "." (so every Number(nutrition[key]) call keeps working unchanged) but shown to the user
// with "," — this converts a stored value back for the input's own value prop.
export const toDisplayDecimal = (value: string): string => value.replace(".", ",");

const buildNokkelhulletMessage = (
  label: string,
  comparison: string,
  value: string | number,
): string =>
  `Produktet innfrir ikke Nøkkelhullet på grunn av mengden ${label}. ` +
  `Mengden på ${label} må være ${comparison} ${typeof value === "number" ? formatNoNumber(value) : value} g/100 g for å møte kravene for Nøkkelhullsmerking.`;

// Builds the human-readable reason a field fails Nøkkelhullet, based on the same
// thresholds isFieldFailing checks against.
export const getNokkelhulletFailureMessage = (
  key: string,
  schema: CalculatorSchema,
): string => {
  const t = schema?.thresholds;
  if (!t) return "";

  switch (key) {
    case "fett":
      return t.maxFat != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.fett,
            "lavere enn eller lik",
            t.maxFat,
          )
        : "";
    case "mettede":
      if (t.maxSatFat != null) {
        return buildNokkelhulletMessage(
          NOKKELHULLET_FIELD_LABELS.mettede,
          "lavere enn eller lik",
          t.maxSatFat,
        );
      }
      if (t.dynamicSatFatFraction != null) {
        return buildNokkelhulletMessage(
          NOKKELHULLET_FIELD_LABELS.mettede,
          "lavere enn eller lik",
          `${formatNoNumber(t.dynamicSatFatFraction * 100)} % av fett`,
        );
      }
      return "";
    // Reports whichever cap is stricter when a category defines both — that's
    // the actually binding constraint, since staying under it also satisfies
    // the looser one.
    case "sukkerarter": {
      const caps = [t.maxTotalSugars, t.maxAddedSugars].filter(
        (v): v is number => v != null,
      );
      if (caps.length === 0) return "";
      return buildNokkelhulletMessage(
        NOKKELHULLET_FIELD_LABELS.sukkerarter,
        "lavere enn eller lik",
        Math.min(...caps),
      );
    }
    case "kostfiber":
      return t.minFibre != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.kostfiber,
            "minst",
            t.minFibre,
          )
        : "";
    case "salt":
      return t.maxSalt != null
        ? buildNokkelhulletMessage(
            NOKKELHULLET_FIELD_LABELS.salt,
            "lavere enn eller lik",
            t.maxSalt,
          )
        : "";
    default:
      return "";
  }
};

export type NutritionFormErrors = Record<string, boolean>;

// Validates NutritionForm's fields before a calculation is submitted — every
// relevant field must be filled with a non-negative number, energy must be a
// positive number, and resistant starch can't exceed total starch. Doesn't
// include the onFoodTypeErrorChange side effect the caller also needs to
// fire — that's a prop callback, not part of the pure validation result.
export const validateNutritionForm = (
  foodType: string,
  energyUnit: string,
  nutrition: NutritionValues,
  schema: CalculatorSchema,
  resistantStarch: string,
  totalStarch: string,
): NutritionFormErrors => {
  const errs: NutritionFormErrors = {};
  if (!foodType) errs.foodType = true;
  const energyVal =
    energyUnit === "energikcal" ? nutrition.energikcal : nutrition.energikj;
  // Blank or negative, not zero. Energy used to be the one field that refused a typed 0,
  // which every other nutrient on line below accepts: an energy-free drink, bottled water
  // and a sweetener in drops all declare 0 kcal, and the form would not submit any of them.
  // The backend has the matching rule; see CalculatorRequestDTO.EnergyEntered.
  if (energyVal === "" || Number(energyVal) < 0) errs.energy = true;
  NUTRITION_FIELDS.filter(({ key }) => isFieldRelevant(key, schema)).forEach(
    ({ key, optional }) => {
      // A blank optional field is a complete answer: the producer does not have the
      // figure. A negative one is still a mistake, whether the field was required or not.
      if (optional) {
        if (nutrition[key] !== "" && Number(nutrition[key]) < 0) errs[key] = true;
        return;
      }
      if (nutrition[key] === "" || Number(nutrition[key]) < 0) errs[key] = true;
    },
  );
  if (Number(resistantStarch) > Number(totalStarch)) errs.resistantStarch = true;
  return errs;
};

// The picked kilder of one kind, in the shape the request's vitamins/minerals lists take.
// The unit comes from the option table rather than the form, since that's what the picker
// showed the user next to the amount they typed.
const buildVitaminMineralPayload = (
  otherSubstances: { name: string; amount: string | number }[],
  kind: "vitamin" | "mineral",
  schema: CalculatorSchema,
): { name: string; amount: number; unit: string }[] =>
  (otherSubstances || []).flatMap((s) => {
    const option = (schema?.kilder ?? []).find((k) => k.value === s.name);
    if (!option || option.kind !== kind) return [];
    return [{ name: s.name, amount: Number(s.amount) || 0, unit: option.unit }];
  });

// Maps NutritionForm's local form state (all strings, straight from <input>
// elements) to the numeric payload shape calculateNutrition sends the backend.
// Blank stays blank all the way to the backend. The commas are already gone by the time
// a value is stored, so Number is safe here; see the sanitiser above.
const optionalNumber = (value: string | undefined): number | null => {
  const raw = String(value ?? "").trim();
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const buildCalculationPayload = (
  category: string,
  foodType: string,
  energyUnit: string,
  portionSize: string,
  productType: string,
  nutrition: NutritionValues,
  totalStarch: string,
  resistantStarch: string,
  otherSubstances: { name: string; amount: string | number }[],
  schema: CalculatorSchema,
  // One object rather than two more positional booleans at the end of a ten-argument list,
  // where two adjacent flags of the same type are a transposition waiting to happen.
  declarations: { noAddedSugars: boolean; noAddedSalt: boolean },
): CalculatorRequestPayload => ({
  category,
  foodType,
  energyUnit,
  portionSize: Number(portionSize) || 0,
  productType,
  // The raw strings, before Number() turns both "" and "0" into the same thing.
  energyEntered:
    String(nutrition.energikcal ?? "").trim() !== "" ||
    String(nutrition.energikj ?? "").trim() !== "",
  noAddedSugarsDeclared: declarations.noAddedSugars,
  noAddedSaltDeclared: declarations.noAddedSalt,
  nutrition: {
    energyKcal: Number(nutrition.energikcal) || 0,
    energyKj: Number(nutrition.energikj) || 0,
    fat: Number(nutrition.fett),
    saturatedFat: Number(nutrition.mettede),
    transFat: Number(nutrition.transfett) || 0,
    carbs: Number(nutrition.karbohydrat),
    // No natural/added split anymore (single field, client requirement) — the
    // full total is sent as addedSugars so both the backend's MaxTotalSugars
    // check (naturalSugars + addedSugars) and MaxAddedSugars check still work
    // off it, just stricter than the real rule for MaxAddedSugars-only
    // categories (see CheckNokkelhullet's comment in CalculatorService.cs).
    naturalSugars: 0,
    addedSugars: Number(nutrition.sukkerarter) || 0,
    fibre: Number(nutrition.kostfiber),
    protein: Number(nutrition.protein),
    // addedSalt no longer tracked separately — the backend's "Uten tilsatt
    // salt" claim that needed it is already disabled (CalculatorService.cs),
    // so always sending 0 has no effect on any active calculation.
    salt: Number(nutrition.salt) || 0,
    addedSalt: 0,
    // null, not 0. A product with no omega-3 figure on its label is not a product with
    // none in it, and sending a 0 would have the calculator refuse five claims on a number
    // nobody entered. See CalculatorRequestDTO.MonounsaturatedFat.
    polyols: optionalNumber(nutrition.polyoler),
    monounsaturatedFat: optionalNumber(nutrition.enumettede),
    polyunsaturatedFat: optionalNumber(nutrition.flerumettede),
    alphaLinolenicAcid: optionalNumber(nutrition.alfalinolensyre),
    eicosapentaenoicAcid: optionalNumber(nutrition.eikosapentaensyre),
    docosahexaenoicAcid: optionalNumber(nutrition.dokosaheksaensyre),
    totalStarch: Number(totalStarch) || 0,
    resistantStarch: Number(resistantStarch) || 0,
  },
  // One picker feeds three request lists: the vitamins and minerals are routed by the
  // option table, and everything left over is an "other" substance.
  //
  // An "other" carries no unit, unlike the two lists above, and does not need one: the
  // picker shows the unit the schema gave for that substance, and the backend compares the
  // number against a threshold written in that same unit. Nothing converts at either end,
  // so the figure only has to mean the same thing in both places, which it does because
  // both read it off OtherSubstance.Unit. It used to be true that every "other" was in
  // grams; Vitamin C and Kakaoflavanoler are in milligrams.
  vitamins: buildVitaminMineralPayload(otherSubstances, "vitamin", schema),
  minerals: buildVitaminMineralPayload(otherSubstances, "mineral", schema),
  others: (otherSubstances || [])
    .filter((s) => {
      const option = (schema?.kilder ?? []).find((k) => k.value === s.name);
      return !option || option.kind === "other";
    })
    .map((s) => ({
      name: s.name,
      amount: Number(s.amount) || 0,
    })),
});
