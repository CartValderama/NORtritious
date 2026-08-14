import React, { useState, useEffect } from "react";
import CustomSelect from "../../CustomSelect";
import PanelBox from "./PanelBox";
import LabeledUnitInput from "./LabeledUnitInput";
import RemovablePill from "./RemovablePill";
import { OTHER_SUBSTANCE_OPTIONS } from "../../../utils/calculator/otherSubstanceOptions";

// Not part of OtherClaimRegistry (backend) — Stivelse is its own dedicated
// TotalStarch/ResistantStarch field pair, never sent through the `others` list,
// so it deliberately lives outside OTHER_SUBSTANCE_OPTIONS. `inputType: "starchRatio"`
// tells the picker to render the two-field total/resistant input instead of the
// default single "Mengde" field; `requiresKostfiber: false` keeps it out of the
// Kostfiber gate/budget below.
const STARCH_OPTION = {
  value: "Stivelse",
  label: "Stivelse (resistent)",
  requiresKostfiber: false,
  inputType: "starchRatio",
};

// Every selectable "Kilde til Annet" option, fibre or not — new non-fibre kilder
// (vitamins, minerals, whatever comes next) just get added to OTHER_SUBSTANCE_OPTIONS
// with requiresKostfiber left false and flow through the default single-field path
// below without needing any special-casing here.
const KILDE_OPTIONS = [STARCH_OPTION, ...OTHER_SUBSTANCE_OPTIONS];

// EFSA Helsepåstander panel: Porsjonsstørrelse + the "Kilde til Annet" picker
// (fibre substances and Stivelse). Fully self-contained — owns its own state and
// just reports the values NutritionForm's calculation payload needs (totalStarch,
// resistantStarch, otherSubstances, portionSize) back up via onValuesChange.
// Calculator.jsx force-remounts this (via a changing `key`) to reset it on Nullstill.
// It's also unmounted/remounted every time the panel is collapsed/expanded (so the
// scroll-into-view-on-open effect below keeps firing on each open) — `initialValues`
// is Calculator.jsx's last-reported copy of this panel's own state, fed back in so a
// collapse/expand cycle doesn't wipe out what the user already typed.
const EfsaHealthClaimsPanel = ({ kostfiber, initialValues, onValuesChange, isOpen }) => {
  const [hasStarch, setHasStarch] = useState(!!initialValues?.totalStarch);
  const [totalStarch, setTotalStarch] = useState(initialValues?.totalStarch || "");
  const [resistantStarch, setResistantStarch] = useState(
    initialValues?.resistantStarch || "",
  );
  const [portionSize, setPortionSize] = useState(initialValues?.portionSize || "");
  const [showPortionInfo, setShowPortionInfo] = useState(false);
  const [showEfsaInfo, setShowEfsaInfo] = useState(false);
  const [otherSubstances, setOtherSubstances] = useState(
    initialValues?.otherSubstances || [],
  );
  const [newSubstance, setNewSubstance] = useState(null);
  const [newSubstanceAmount, setNewSubstanceAmount] = useState("");
  const [substanceError, setSubstanceError] = useState("");
  // Only shown once the user has actually opened the kilde picker looking for a
  // fibre source — not by default just because Kostfiber happens to be 0.
  const [attemptedFiberPick, setAttemptedFiberPick] = useState(false);

  const kildeOptionByValue = new Map(KILDE_OPTIONS.map((o) => [o.value, o]));

  const hasFiberSource = kostfiber > 0;
  // Only sum kilder that are actually declared as Kostfiber subsets — a future
  // non-fibre "amount"-type kilde shouldn't count against this budget.
  const usedFiber = otherSubstances
    .filter((s) => kildeOptionByValue.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const fiberFullyUsed = hasFiberSource && usedFiber >= kostfiber;

  // "Added" state lives in different places depending on input shape: the
  // two-field ratio type (Stivelse) tracks itself via hasStarch, everything
  // else lives in the generic otherSubstances array.
  const isKildeAdded = (opt) =>
    opt.inputType === "starchRatio"
      ? hasStarch
      : otherSubstances.some((s) => s.name === opt.value);

  // Only options flagged requiresKostfiber get gated/removed once Kostfiber is
  // 0 or its budget is used up — everything else (Stivelse today, whatever
  // else gets added to Kilde til Annet later) stays selectable.
  const kildeOptions = KILDE_OPTIONS.filter((opt) => {
    if (isKildeAdded(opt)) return false;
    if (opt.requiresKostfiber && (!hasFiberSource || fiberFullyUsed))
      return false;
    return true;
  });

  // If Kostfiber goes back to 0/empty, any already-picked fibre substances no
  // longer make sense — clear them so nothing stale gets submitted.
  useEffect(() => {
    if (!hasFiberSource) {
      setOtherSubstances([]);
      setNewSubstance(null);
      setNewSubstanceAmount("");
      setSubstanceError("");
    }
  }, [hasFiberSource]);

  // Panel now stays mounted so the expand/collapse can animate smoothly (grid-rows
  // transition in NutritionForm.jsx) — scroll on every transition into the open
  // state instead of on mount. Delayed to match that 0.3s transition so it scrolls
  // once the panel has actually grown to full height, not while it's still near 0.
  // block: "center" instead of "start" so the panel lands in the middle of the
  // viewport rather than snapped to the very top, which felt like it scrolled too far.
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      document
        .getElementById("efsa-health-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  // Report the values NutritionForm's calculation payload needs back up to
  // Calculator.jsx whenever any of them change.
  useEffect(() => {
    onValuesChange({
      totalStarch,
      resistantStarch,
      otherSubstances,
      portionSize,
    });
  }, [
    totalStarch,
    resistantStarch,
    otherSubstances,
    portionSize,
    onValuesChange,
  ]);

  const handleAddSubstance = () => {
    if (!newSubstance) return;

    // The ratio input shape (Stivelse today) is validated/stored separately
    // from the generic amount-based kilder and never touches Kostfiber.
    if (newSubstance.inputType === "starchRatio") {
      if (!totalStarch) return;
      setHasStarch(true);
      setSubstanceError("");
      setNewSubstance(null);
      return;
    }

    if (!newSubstanceAmount) return;

    const amount = Number(newSubstanceAmount) || 0;
    if (newSubstance.requiresKostfiber) {
      if (fiberFullyUsed) return;

      // A specific fibre source can't exceed total Kostfiber — it's a subset of
      // it, and neither can the sum of every fibre source added together.
      const otherTotal = otherSubstances
        .filter(
          (s) =>
            s.name !== newSubstance.value &&
            kildeOptionByValue.get(s.name)?.requiresKostfiber,
        )
        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      if (otherTotal + amount > kostfiber) {
        setSubstanceError(
          `Summen av kilder (${otherTotal + amount}g) kan ikke overstige Kostfiber (${kostfiber}g) i næringstabellen.`,
        );
        return;
      }
    }

    setSubstanceError("");
    setOtherSubstances((prev) => [
      ...prev.filter((s) => s.name !== newSubstance.value),
      { name: newSubstance.value, amount: newSubstanceAmount },
    ]);
    setNewSubstance(null);
    setNewSubstanceAmount("");
  };

  const handleRemoveSubstance = (name) => {
    if (kildeOptionByValue.get(name)?.inputType === "starchRatio") {
      setHasStarch(false);
      setTotalStarch("");
      setResistantStarch("");
      return;
    }
    setOtherSubstances((prev) => prev.filter((s) => s.name !== name));
    setSubstanceError("");
  };

  return (
    <div id="efsa-health-panel">
      <PanelBox className="rounded-bottom" rounded={false} border={false} bg="#fff">
        {/* Porsjonsstørrelse — same 4-column grid as the main field list, so it lines
            up with the rest of the form even though it's the only cell in use here. */}
        <div className="d-grid gap-3 mb-3 v3-field-grid">
          <div style={{ position: "relative" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <label htmlFor="portionSize" className="form-label mb-0 v3-label-indent">
                Porsjonsstørrelse
              </label>
              <i
                className="bi bi-info-circle text-muted"
                style={{
                  cursor: "default",
                  fontSize: "1rem",
                  flexShrink: 0,
                }}
                onMouseEnter={() => setShowPortionInfo(true)}
                onMouseLeave={() => setShowPortionInfo(false)}
              />
              {showPortionInfo && (
                <div
                  style={{
                    position: "absolute",
                    top: "1.8rem",
                    left: 0,
                    width: "280px",
                    backgroundColor: "#fff",
                    border: "1px solid #bbb",
                    borderRadius: "4px",
                    padding: "0.75rem 1rem",
                    zIndex: 100,
                  }}
                >
                  Dette feltet er nyttig for påstander som krever en oppgitt
                  porsjonsstørrelse (f.eks. beta-glukaner og
                  blodsukkerrespons). Å la det stå tomt påvirker ikke andre
                  beregninger.
                </div>
              )}
            </div>
            <div className="input-group">
              <input
                id="portionSize"
                type="number"
                min="0"
                className="form-control"
                style={{ minWidth: 0 }}
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                placeholder="f.eks. 100"
              />
              <span className="input-group-text">g/ml</span>
            </div>
          </div>
        </div>

        {/* Kilde til Annet — repeatable form with inline item creation: pick a kilde,
            its fields appear, "Legg til" commits it as a pill below and resets the
            picker back to empty so another one can be added right after. */}
        <div className="d-grid gap-3 align-items-end mb-3 v3-field-grid">
          <div style={{ minWidth: 0 }}>
            <label
              className="form-label d-block v3-label-indent"
              style={{ marginBottom: "0.5rem" }}
            >
              Velg kilde (g/100g)
            </label>
            <CustomSelect
              options={kildeOptions}
              placeholder="Velg kilde"
              value={newSubstance}
              onChange={(opt) => {
                setNewSubstance(opt);
                setSubstanceError("");
              }}
              onMenuOpen={() => setAttemptedFiberPick(true)}
              isDisabled={kildeOptions.length === 0}
            />
          </div>

          {newSubstance?.inputType === "starchRatio" ? (
            <>
              <LabeledUnitInput
                id="totalStarch"
                label="Totalt stivelse"
                unit="g"
                max="100"
                placeholder="f.eks. 50"
                value={totalStarch}
                onChange={(e) => setTotalStarch(e.target.value)}
              />
              <LabeledUnitInput
                id="resistantStarch"
                label="Herav resistent"
                unit="g"
                max="100"
                placeholder="f.eks. 10"
                value={resistantStarch}
                onChange={(e) => setResistantStarch(e.target.value)}
              />
            </>
          ) : (
            <LabeledUnitInput
              label="Mengde"
              unit="g"
              placeholder="f.eks. 5"
              value={newSubstanceAmount}
              onChange={(e) => {
                setNewSubstanceAmount(e.target.value);
                setSubstanceError("");
              }}
              disabled={newSubstance?.requiresKostfiber && fiberFullyUsed}
            />
          )}

          <button
            type="button"
            className="btn btn-outline-primary btn-legg-til d-flex align-items-center justify-content-center gap-2"
            style={{ whiteSpace: "nowrap" }}
            onClick={handleAddSubstance}
            disabled={
              !newSubstance ||
              (newSubstance.inputType === "starchRatio"
                ? !totalStarch
                : !newSubstanceAmount ||
                  (newSubstance.requiresKostfiber && fiberFullyUsed))
            }
            title="Legg til i beregning"
          >
            <i className="bi bi-plus-lg" />
            Legg til i beregning
          </button>
        </div>

        {!hasFiberSource && attemptedFiberPick && (
          <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
            Kostfiber i næringstabellen er satt til 0.
          </p>
        )}

        {fiberFullyUsed && (
          <div className="text-warning-emphasis small mb-2">
            <i className="bi bi-exclamation-triangle me-1" />
            All kostfiber ({kostfiber}g) er fordelt. Fjern en kilde for å
            bytte den ut.
          </div>
        )}

        {newSubstance?.inputType === "starchRatio" &&
          Number(resistantStarch) > Number(totalStarch) && (
            <div className="text-danger small mt-2">
              Resistent stivelse ({resistantStarch}g) kan ikke overstige totalt
              stivelsesinnhold ({totalStarch}g).
            </div>
          )}

        {substanceError && (
          <div className="text-danger small mt-2">{substanceError}</div>
        )}

        {["Beta-glucans", "Barley beta-glucans", "Oat beta-glucan"].includes(
          newSubstance?.value,
        ) && (
          <p className="mt-1 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
            Porsjonsstørrelsen øverst i panelet trengs for å beregne
            fiberinnholdet denne fiberpåstanden er basert på.
          </p>
        )}

        {(hasStarch || otherSubstances.length > 0) && (
          <div className="d-flex flex-wrap gap-2 pt-2">
            {hasStarch && (
              <RemovablePill
                label={`Stivelse: ${totalStarch}g totalt, ${resistantStarch || 0}g resistent`}
                onRemove={() => handleRemoveSubstance("Stivelse")}
                ariaLabel="Fjern Stivelse"
              />
            )}

            {otherSubstances.map((s) => {
              const label =
                OTHER_SUBSTANCE_OPTIONS.find((o) => o.value === s.name)
                  ?.label || s.name;
              return (
                <RemovablePill
                  key={s.name}
                  label={`${label}: ${s.amount}g`}
                  onRemove={() => handleRemoveSubstance(s.name)}
                  ariaLabel={`Fjern ${label}`}
                />
              );
            })}
          </div>
        )}
      </PanelBox>
    </div>
  );
};

export default EfsaHealthClaimsPanel;
