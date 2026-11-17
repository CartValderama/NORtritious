import { useEffect, useRef, useState } from "react";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import {
  kildeByValue,
  calculateUsedFiber,
  validateFiberAddition,
  getSelectableKildeOptions,
  kildeUnit,
  kildePlaceholder,
  type KildeOption,
} from "../../utils/calculator/kildeOptions";
import type {
  CalculatorSchema,
  KildeField,
} from "../../services/calculatorService";

// All local "draft" state, effects and handlers behind the EFSA
// Helsepåstander panel's "Kilde til Annet" picker — reads/writes
// calculatorFormStore itself, so EfsaHealthClaimsPanel.jsx just calls this
// and gets back what it needs to render instead of owning 3 effects, 5
// pieces of state and 2 handlers directly.
export function useKildePicker(schema: CalculatorSchema) {
  const { efsaValues, setEfsaField, setEfsaValues, nutrition, resetToken } =
    useCalculatorFormStore((s) => ({
      efsaValues: s.efsaValues,
      setEfsaField: s.setEfsaField,
      setEfsaValues: s.setEfsaValues,
      nutrition: s.nutrition,
      resetToken: s.resetToken,
    }));
  const byValue = kildeByValue(schema);
  const kostfiber = Number(nutrition.kostfiber) || 0;
  const { totalStarch, resistantStarch, otherSubstances, portionSize } =
    efsaValues;

  // hasStarch is "committed via Legg til" AND-ed with "the store still
  // actually has a value" — so it automatically drops to false the moment
  // anything resets totalStarch (Nullstill, disabling EFSA, changing
  // category), with no extra reset plumbing needed for this one specifically.
  const [starchCommitted, setStarchCommitted] = useState(!!totalStarch);
  const hasStarch = starchCommitted && !!totalStarch;
  const [newSubstance, setNewSubstance] = useState<KildeOption | null>(null);
  const [newSubstanceAmount, setNewSubstanceAmount] = useState("");
  const [substanceError, setSubstanceError] = useState("");
  // Only shown once the user has actually opened the kilde picker looking for
  // a fibre source — not by default just because Kostfiber happens to be 0.
  const [attemptedFiberPick, setAttemptedFiberPick] = useState(false);

  // The rest of this picker's draft/UI state can't be derived from a store
  // value the way hasStarch is, so it needs an explicit "someone reset
  // things" signal — resetToken bumps every time resetEfsaValues runs
  // (Nullstill, disabling EFSA, changing category). Skips the first run so
  // mount (where the state above is already correctly seeded) doesn't
  // immediately clear itself.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setStarchCommitted(false);
    setNewSubstance(null);
    setNewSubstanceAmount("");
    setSubstanceError("");
    setAttemptedFiberPick(false);
  }, [resetToken]);

  const hasFiberSource = kostfiber > 0;
  const usedFiber = calculateUsedFiber(otherSubstances, byValue);
  const fiberFullyUsed = hasFiberSource && usedFiber >= kostfiber;

  const kildeOptions = getSelectableKildeOptions(
    schema,
    otherSubstances,
    hasStarch,
    hasFiberSource,
    fiberFullyUsed,
  );

  // If Kostfiber goes back to 0/empty, any already-picked fibre substances no
  // longer make sense, so clear them before anything stale gets submitted. Only the
  // fibre-gated ones: a vitamin or mineral has nothing to do with Kostfiber and
  // must survive, or entering calcium and then zeroing the fibre field would
  // silently drop it.
  useEffect(() => {
    if (!hasFiberSource) {
      setEfsaField(
        "otherSubstances",
        otherSubstances.filter((s) => !byValue.get(s.name)?.requiresKostfiber),
      );
      setNewSubstance(null);
      setNewSubstanceAmount("");
      setSubstanceError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFiberSource]);

  // A kilde that carries no amount of its own: its boxes write straight into the
  // nutrition figures, so it is stored and validated differently from the amount-based
  // kilder and never touches Kostfiber. Read off the served kind rather than off the name,
  // which is what lets the panel render any kilde's boxes without knowing what it is.
  const isNutritionKilde = newSubstance?.kind === "nutrition";

  // The boxes to draw for the current pick: whatever the backend described, or the ordinary
  // single "Mengde" one for the kilde that described none, which is most of them.
  //
  // An empty array is not the same as none described, and the difference is the water row:
  // it describes zero boxes on purpose, because its claims condition nothing about the food
  // and there is no figure to ask for. Testing for length here would have given it a Mengde
  // box whose answer nothing reads.
  const kildeFields: KildeField[] = Array.isArray(newSubstance?.fields)
    ? newSubstance.fields
    : [
        {
          target: "amount",
          label: "Mengde",
          unit: kildeUnit(newSubstance),
          placeholder: kildePlaceholder(newSubstance),
        },
      ];

  // A kilde whose declaration is the picking of it, with nothing to fill in.
  const declaresNoAmount = kildeFields.length === 0;

  // Single source of truth for "is there enough filled in to add this kilde
  // right now" — used for both the Legg til button's disabled state and as
  // handleAddSubstance's own guard, so the two can't drift apart.
  const canAddSubstance =
    !!newSubstance &&
    (declaresNoAmount
      ? // nothing to fill in, so picking it is already enough
        true
      : isNutritionKilde
        ? // the first box is the figure the others are fractions of, and none of them means
          // anything without it
          !!efsaValues[kildeFields[0].target as keyof typeof efsaValues]
        : !!newSubstanceAmount &&
          !(newSubstance.requiresKostfiber && fiberFullyUsed));

  const handleAddSubstance = () => {
    if (!canAddSubstance || !newSubstance) return;

    if (isNutritionKilde) {
      setStarchCommitted(true);
      setSubstanceError("");
      setNewSubstance(null);
      return;
    }

    const amount = Number(newSubstanceAmount) || 0;
    if (newSubstance.requiresKostfiber) {
      const fiberError = validateFiberAddition(
        otherSubstances,
        byValue,
        newSubstance.value,
        amount,
        kostfiber,
      );
      if (fiberError) {
        setSubstanceError(fiberError);
        return;
      }
    }

    setSubstanceError("");
    setEfsaField("otherSubstances", [
      ...otherSubstances.filter((s) => s.name !== newSubstance.value),
      // "0" rather than the empty draft string for a kilde with no box: the request's amount
      // is a number, and the backend does not read this one at all.
      { name: newSubstance.value, amount: declaresNoAmount ? "0" : newSubstanceAmount },
    ]);
    setNewSubstance(null);
    setNewSubstanceAmount("");
  };

  const handleRemoveSubstance = (name: string) => {
    const opt = byValue.get(name);
    if (opt?.kind === "nutrition") {
      setStarchCommitted(false);
      // Every box it owns, not the two that existed when this was written: a figure left
      // behind by a removed kilde is one the next calculation would still read.
      // Indexed by a served name, so the keys are strings rather than a union the
      // compiler can line up with the store's shape. A field naming something the store
      // does not hold writes a key nothing reads, which is inert.
      const cleared: Record<string, unknown> = { ...efsaValues };
      for (const f of opt.fields ?? []) cleared[f.target] = "";
      setEfsaValues(cleared as unknown as typeof efsaValues);
      return;
    }
    setEfsaField(
      "otherSubstances",
      otherSubstances.filter((s) => s.name !== name),
    );
    setSubstanceError("");
  };

  return {
    byValue,
    efsaValues,
    kildeFields,
    totalStarch,
    resistantStarch,
    otherSubstances,
    portionSize,
    kostfiber,
    setEfsaField,
    hasStarch,
    newSubstance,
    setNewSubstance,
    newSubstanceAmount,
    setNewSubstanceAmount,
    substanceError,
    setSubstanceError,
    attemptedFiberPick,
    setAttemptedFiberPick,
    hasFiberSource,
    fiberFullyUsed,
    kildeOptions,
    isNutritionKilde,
    canAddSubstance,
    handleAddSubstance,
    handleRemoveSubstance,
  };
}
