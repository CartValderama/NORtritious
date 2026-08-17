// Mirrors the keys of OtherClaimRegistry in CalculatorService.cs — must match exactly,
// since `value` here is sent as the "name" the backend looks up. Shared between
// Calculator.jsx (the picker) and NutritionResult.jsx (translating result labels back
// to Norwegian, since the backend echoes the English `name` it was given).
//
// `requiresKostfiber: true` marks substances that are a subset of Kostfiber, so the
// "Kilde til Annet" picker in Calculator.jsx gates/budget-checks them against the
// Kostfiber field. Substances that aren't fibre-related (e.g. Stivelse, or anything
// added here later that isn't a fibre subset) should omit it/set it to false so the
// picker treats them as ungated.
export interface OtherSubstanceOption {
  value: string;
  label: string;
  requiresKostfiber: boolean;
  // The beta-glucan blood-sugar-response claims need a portion size to
  // compute — flagging it here means the picker's "fill in Porsjonsstørrelse"
  // hint follows the option automatically instead of a hardcoded list of
  // substance names living separately in the component.
  requiresPortionSize?: boolean;
}

export const OTHER_SUBSTANCE_OPTIONS: OtherSubstanceOption[] = [
  {
    value: "Beta-glucans",
    label: "Beta-glukaner",
    requiresKostfiber: true,
    requiresPortionSize: true,
  },
  {
    value: "Barley beta-glucans",
    label: "Byggbeta-glukaner",
    requiresKostfiber: true,
    requiresPortionSize: true,
  },
  {
    value: "Oat beta-glucan",
    label: "Havrebeta-glukan",
    requiresKostfiber: true,
    requiresPortionSize: true,
  },
  {
    value: "Barley grain fibre",
    label: "Byggfiber",
    requiresKostfiber: true,
  },
  { value: "Rye fibre", label: "Rugfiber", requiresKostfiber: true },
  {
    value: "Wheat bran fibre",
    label: "Hvetekli-fiber",
    requiresKostfiber: true,
  },
  { value: "Oat grain fibre", label: "Havrefiber", requiresKostfiber: true },
];

// Used to gate the "fill in Porsjonsstørrelse" hint under the picker —
// checked against the currently-selected draft substance, not a committed
// one, so it shows up as soon as the user picks it.
export const substanceRequiresPortionSize = (
  value: string | null | undefined,
): boolean =>
  OTHER_SUBSTANCE_OPTIONS.some(
    (o) => o.value === value && o.requiresPortionSize === true,
  );
