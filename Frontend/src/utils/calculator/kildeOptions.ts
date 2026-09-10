import type { CalculatorSchema, KildeOption as ServedKilde } from "../../services/calculatorService";

export interface StarchOption {
  value: string;
  label: string;
  unit: string;
  kind: "other";
  requiresKostfiber: false;
  requiresPortionSize: false;
  inputType: "starchRatio";
}

export interface AddedSubstance {
  name: string;
  amount: string | number;
}

export type KildeOption = ServedKilde | StarchOption;

// The only kilde not served by the schema. Stivelse isn't in OtherClaimRegistry: it has its
// own TotalStarch/ResistantStarch field pair on the request rather than going through the
// `others` list, so the backend has no registry entry to describe it. `inputType:
// "starchRatio"` tells the picker to render that two-field input instead of the single
// "Mengde" one.
export const STARCH_OPTION: StarchOption = {
  value: "Stivelse",
  label: "Stivelse (resistent)",
  unit: "g",
  kind: "other",
  requiresKostfiber: false,
  requiresPortionSize: false,
  inputType: "starchRatio",
};

// Everything selectable in the picker. Which substances exist, their units and whether each
// needs a portion size are properties of the claim registries, so they arrive on the schema
// rather than being kept in step by hand here.
export const kildeOptionsFrom = (schema: CalculatorSchema): KildeOption[] => [
  STARCH_OPTION,
  ...(schema?.kilder ?? []),
];

export const kildeByValue = (schema: CalculatorSchema): Map<string, KildeOption> =>
  new Map(kildeOptionsFrom(schema).map((o) => [o.value, o]));

export const kildeUnit = (opt: KildeOption | null | undefined): string => opt?.unit ?? "g";

// A grams-sized hint suits the fibre sources but not a milligram or microgram amount, so the
// example figure follows the unit. Purely presentational, which is why it isn't served.
export const kildePlaceholder = (opt: KildeOption | null | undefined): string => {
  switch (opt?.unit) {
    case "mg":
      return "f.eks. 120";
    case "µg":
      return "f.eks. 0,75";
    default:
      return "f.eks. 5";
  }
};

// Sum of already-added kilder that are declared as Kostfiber subsets. A non-fibre kilde
// shouldn't count against the Kostfiber budget.
export const calculateUsedFiber = (
  otherSubstances: AddedSubstance[],
  byValue: Map<string, KildeOption>,
): number =>
  otherSubstances
    .filter((s) => byValue.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

// "Added" state lives in different places depending on input shape: the two-field ratio type
// (Stivelse) tracks itself via hasStarch, everything else lives in the generic
// otherSubstances array. `"inputType" in opt` narrows the union without the served options
// needing to declare the field.
const isKildeAdded = (
  opt: KildeOption,
  otherSubstances: AddedSubstance[],
  hasStarch: boolean,
): boolean =>
  "inputType" in opt && opt.inputType === "starchRatio"
    ? hasStarch
    : otherSubstances.some((s) => s.name === opt.value);

// Every kilde still selectable: not already added, and for options gated to Kostfiber, only
// while Kostfiber has a value and isn't already fully budgeted by other fibre sources.
export const getSelectableKildeOptions = (
  schema: CalculatorSchema,
  otherSubstances: AddedSubstance[],
  hasStarch: boolean,
  hasFiberSource: boolean,
  fiberFullyUsed: boolean,
): KildeOption[] =>
  kildeOptionsFrom(schema).filter((opt) => {
    if (isKildeAdded(opt, otherSubstances, hasStarch)) return false;
    if (opt.requiresKostfiber && (!hasFiberSource || fiberFullyUsed)) return false;
    return true;
  });

// A specific fibre source can't exceed total Kostfiber, since it's a subset of it, and
// neither can the sum of every fibre source together. Returns an error message describing
// the overflow, or null if the addition is valid.
export const validateFiberAddition = (
  otherSubstances: AddedSubstance[],
  byValue: Map<string, KildeOption>,
  newSubstanceValue: string,
  amount: number,
  kostfiber: number,
): string | null => {
  const otherTotal = otherSubstances
    .filter((s) => s.name !== newSubstanceValue && byValue.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  if (otherTotal + amount > kostfiber) {
    return `Summen av kilder (${otherTotal + amount}g) kan ikke overstige Kostfiber (${kostfiber}g) i næringstabellen.`;
  }
  return null;
};
