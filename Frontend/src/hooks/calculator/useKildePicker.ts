import { useEffect, useRef, useState } from "react";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";
import {
  kildeByValue,
  calculateUsedFiber,
  validateFiberAddition,
  getSelectableKildeOptions,
  type KildeOption,
} from "../../utils/calculator/kildeOptions";
import type { CalculatorSchema } from "../../services/calculatorService";

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

  // The ratio input shape (Stivelse today) is validated/stored separately
  // from the generic amount-based kilder and never touches Kostfiber — this
  // is the one flag the component needs to branch on, computed once instead
  // of re-derived at every call site.
  const isStarchRatio =
    !!newSubstance && "inputType" in newSubstance && newSubstance.inputType === "starchRatio";

  // Single source of truth for "is there enough filled in to add this kilde
  // right now" — used for both the Legg til button's disabled state and as
  // handleAddSubstance's own guard, so the two can't drift apart.
  const canAddSubstance =
    !!newSubstance &&
    (isStarchRatio
      ? !!totalStarch
      : !!newSubstanceAmount &&
        !(newSubstance.requiresKostfiber && fiberFullyUsed));

  const handleAddSubstance = () => {
    if (!canAddSubstance || !newSubstance) return;

    if (isStarchRatio) {
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
      { name: newSubstance.value, amount: newSubstanceAmount },
    ]);
    setNewSubstance(null);
    setNewSubstanceAmount("");
  };

  const handleRemoveSubstance = (name: string) => {
    const opt = byValue.get(name);
    if (opt && "inputType" in opt && opt.inputType === "starchRatio") {
      setStarchCommitted(false);
      setEfsaValues({ ...efsaValues, totalStarch: "", resistantStarch: "" });
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
    isStarchRatio,
    canAddSubstance,
    handleAddSubstance,
    handleRemoveSubstance,
  };
}
