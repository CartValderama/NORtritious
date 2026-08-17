import {
  OTHER_SUBSTANCE_OPTIONS,
  type OtherSubstanceOption,
} from "./otherSubstanceOptions";

export interface StarchOption {
  value: string;
  label: string;
  requiresKostfiber: false;
  inputType: "starchRatio";
}

export interface AddedSubstance {
  name: string;
  amount: string | number;
}

// Not part of OtherClaimRegistry (backend) — Stivelse is its own dedicated
// TotalStarch/ResistantStarch field pair, never sent through the `others` list,
// so it deliberately lives outside OTHER_SUBSTANCE_OPTIONS. `inputType: "starchRatio"`
// tells the picker to render the two-field total/resistant input instead of the
// default single "Mengde" field; `requiresKostfiber: false` keeps it out of the
// Kostfiber gate/budget below.
export const STARCH_OPTION: StarchOption = {
  value: "Stivelse",
  label: "Stivelse (resistent)",
  requiresKostfiber: false,
  inputType: "starchRatio",
};

// Every selectable "Kilde til Annet" option, fibre or not — new non-fibre kilder
// (vitamins, minerals, whatever comes next) just get added to OTHER_SUBSTANCE_OPTIONS
// with requiresKostfiber left false and flow through the default single-field path
// without needing any special-casing here.
export const KILDE_OPTIONS: (StarchOption | OtherSubstanceOption)[] = [
  STARCH_OPTION,
  ...OTHER_SUBSTANCE_OPTIONS,
];

// Built once at module load — KILDE_OPTIONS is static, so there's no reason to
// rebuild this lookup on every render of whatever component uses it.
export const KILDE_OPTION_BY_VALUE = new Map(
  KILDE_OPTIONS.map((o) => [o.value, o]),
);

// Sum of already-added kilder that are actually declared as Kostfiber subsets —
// a non-fibre "amount"-type kilde shouldn't count against the Kostfiber budget.
export const calculateUsedFiber = (otherSubstances: AddedSubstance[]): number =>
  otherSubstances
    .filter((s) => KILDE_OPTION_BY_VALUE.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

// "Added" state lives in different places depending on input shape: the
// two-field ratio type (Stivelse) tracks itself via hasStarch, everything
// else lives in the generic otherSubstances array. `"inputType" in opt`
// narrows the union without OtherSubstanceOption needing to declare the
// field itself.
const isKildeAdded = (
  opt: StarchOption | OtherSubstanceOption,
  otherSubstances: AddedSubstance[],
  hasStarch: boolean,
): boolean =>
  "inputType" in opt && opt.inputType === "starchRatio"
    ? hasStarch
    : otherSubstances.some((s) => s.name === opt.value);

// Every kilde still selectable in the "Velg kilde" picker: not already
// added, and — for options gated to Kostfiber — only while Kostfiber has a
// value and isn't already fully budgeted by other fibre sources.
export const getSelectableKildeOptions = (
  otherSubstances: AddedSubstance[],
  hasStarch: boolean,
  hasFiberSource: boolean,
  fiberFullyUsed: boolean,
): (StarchOption | OtherSubstanceOption)[] =>
  KILDE_OPTIONS.filter((opt) => {
    if (isKildeAdded(opt, otherSubstances, hasStarch)) return false;
    if (opt.requiresKostfiber && (!hasFiberSource || fiberFullyUsed))
      return false;
    return true;
  });

// A specific fibre source can't exceed total Kostfiber — it's a subset of it,
// and neither can the sum of every fibre source added together. Returns an
// error message describing the overflow, or null if the addition is valid.
export const validateFiberAddition = (
  otherSubstances: AddedSubstance[],
  newSubstanceValue: string,
  amount: number,
  kostfiber: number,
): string | null => {
  const otherTotal = otherSubstances
    .filter(
      (s) =>
        s.name !== newSubstanceValue &&
        KILDE_OPTION_BY_VALUE.get(s.name)?.requiresKostfiber,
    )
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  if (otherTotal + amount > kostfiber) {
    return `Summen av kilder (${otherTotal + amount}g) kan ikke overstige Kostfiber (${kostfiber}g) i næringstabellen.`;
  }
  return null;
};
