import React, { useState, useEffect } from "react";
import CustomSelect from "../../CustomSelect";
import { OTHER_SUBSTANCE_OPTIONS } from "../../../utils/calculator/otherSubstanceOptions";

// "old"-only fork of EfsaHealthClaimsPanel.jsx — identical behaviour, the only
// difference is the Kilde til Annet amount labels drop the "(g/100g)" suffix
// (Totalt stivelse / Herav resistent / Mengde). "new" keeps the suffix.
const STARCH_OPTION = {
  value: "Stivelse",
  label: "Stivelse (resistent)",
  requiresKostfiber: false,
  inputType: "starchRatio",
};

const KILDE_OPTIONS = [STARCH_OPTION, ...OTHER_SUBSTANCE_OPTIONS];

const EfsaHealthClaimsPanel = ({ kostfiber, onValuesChange }) => {
  const [hasStarch, setHasStarch] = useState(false);
  const [totalStarch, setTotalStarch] = useState("");
  const [resistantStarch, setResistantStarch] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [showPortionInfo, setShowPortionInfo] = useState(false);
  const [otherSubstances, setOtherSubstances] = useState([]);
  const [newSubstance, setNewSubstance] = useState(null);
  const [newSubstanceAmount, setNewSubstanceAmount] = useState("");
  const [substanceError, setSubstanceError] = useState("");
  const [attemptedFiberPick, setAttemptedFiberPick] = useState(false);

  const kildeOptionByValue = new Map(KILDE_OPTIONS.map((o) => [o.value, o]));

  const hasFiberSource = kostfiber > 0;
  const usedFiber = otherSubstances
    .filter((s) => kildeOptionByValue.get(s.name)?.requiresKostfiber)
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const fiberFullyUsed = hasFiberSource && usedFiber >= kostfiber;

  const isKildeAdded = (opt) =>
    opt.inputType === "starchRatio"
      ? hasStarch
      : otherSubstances.some((s) => s.name === opt.value);

  const kildeOptions = KILDE_OPTIONS.filter((opt) => {
    if (isKildeAdded(opt)) return false;
    if (opt.requiresKostfiber && (!hasFiberSource || fiberFullyUsed))
      return false;
    return true;
  });

  useEffect(() => {
    if (!hasFiberSource) {
      setOtherSubstances([]);
      setNewSubstance(null);
      setNewSubstanceAmount("");
      setSubstanceError("");
    }
  }, [hasFiberSource]);

  useEffect(() => {
    document
      .getElementById("efsa-health-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
    <div
      id="efsa-health-panel"
      className="py-3 px-4"
      style={{
        backgroundColor: "#fafafa",
        borderRadius: "0.7rem",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2 mb-1 position-relative">
          <label htmlFor="portionSize" className="form-label mb-0">
            Porsjonsstørrelse av produktet (g/ml)
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
              porsjonsstørrelse (f.eks. beta-glukaner og blodsukkerrespons). Å
              la det stå tomt påvirker ikke andre beregninger.
            </div>
          )}
        </div>
        <input
          id="portionSize"
          type="number"
          min="0"
          className="form-control"
          style={{ maxWidth: "140px" }}
          value={portionSize}
          onChange={(e) => setPortionSize(e.target.value)}
          placeholder="f.eks. 100"
        />
      </div>
      <div className="border-top pt-3">
        <div className="d-flex align-items-center mb-3">
          <span className="fw-semibold me-2">Kilde til Annet</span>
        </div>

        {!hasFiberSource && attemptedFiberPick && (
          <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
            Kostfiber i næringstabellen er satt til 0.
          </p>
        )}

        {fiberFullyUsed && (
          <div className="text-warning small mb-2">
            <i className="bi bi-exclamation-triangle me-1" />
            All Kostfiber ({kostfiber}g) er allerede fordelt på valgte
            fiberkilder. Fjern en for å legge til en annen — andre typer kilder
            kan fortsatt legges til.
          </div>
        )}

        <div className="d-flex flex-nowrap align-items-end gap-2">
          <div style={{ flex: "2 1 200px" }}>
            <label
              className="form-label d-block"
              style={{
                height: "1.2rem",
                marginBottom: "0.75rem",
              }}
            >
              Velg kilde
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
              <div style={{ flex: "1 1 150px" }}>
                <label
                  htmlFor="totalStarch"
                  className="form-label d-block"
                  style={{
                    height: "1.2rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  Totalt stivelse
                </label>
                <input
                  id="totalStarch"
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={totalStarch}
                  onChange={(e) => setTotalStarch(e.target.value)}
                  placeholder="f.eks. 50"
                />
              </div>
              <div style={{ flex: "1 1 150px" }}>
                <label
                  htmlFor="resistantStarch"
                  className="form-label d-block"
                  style={{
                    height: "1.2rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  Herav resistent
                </label>
                <input
                  id="resistantStarch"
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={resistantStarch}
                  onChange={(e) => setResistantStarch(e.target.value)}
                  placeholder="f.eks. 10"
                />
              </div>
            </>
          ) : (
            <div style={{ flex: "1 1 150px" }}>
              <label
                className="form-label d-block"
                style={{
                  height: "1.2rem",
                  marginBottom: "0.75rem",
                }}
              >
                Mengde
              </label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={newSubstanceAmount}
                onChange={(e) => {
                  setNewSubstanceAmount(e.target.value);
                  setSubstanceError("");
                }}
                placeholder="f.eks. 5"
                disabled={newSubstance?.requiresKostfiber && fiberFullyUsed}
              />
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-legg-til flex-shrink-0 d-flex align-items-center gap-1"
            onClick={handleAddSubstance}
            disabled={
              !newSubstance ||
              (newSubstance.inputType === "starchRatio"
                ? !totalStarch
                : !newSubstanceAmount ||
                  (newSubstance.requiresKostfiber && fiberFullyUsed))
            }
          >
            <i className="bi bi-plus-lg" />
            Legg til
          </button>
        </div>

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

        {newSubstance?.inputType === "starchRatio" && (
          <p className="mt-1 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
            Kun relevant hvis fordøyelig stivelse er erstattet med resistent
            stivelse. Påstanden krever at resistent stivelse utgjør minst 14 %
            av total stivelse.
          </p>
        )}

        {["Beta-glucans", "Barley beta-glucans", "Oat beta-glucan"].includes(
          newSubstance?.value,
        ) && (
          <p className="mt-1 mb-0 text-muted" style={{ fontSize: "0.8rem" }}>
            Bruker porsjonsstørrelsen øverst i panelet — uten den kan ikke denne
            påstanden beregnes.
          </p>
        )}

        {(hasStarch || otherSubstances.length > 0) && (
          <div className="d-flex flex-wrap gap-2 mt-3">
            {hasStarch && (
              <div
                className="d-flex align-items-stretch rounded-pill overflow-hidden"
                style={{ fontSize: "0.85rem" }}
              >
                <span
                  className="d-flex align-items-center px-3 py-1"
                  style={{
                    backgroundColor: "#f1f1f1",
                    color: "#333",
                  }}
                >
                  Stivelse — {totalStarch}g totalt, {resistantStarch || 0}g
                  resistent
                </span>
                <button
                  type="button"
                  className="d-flex align-items-center justify-content-center border-0 px-2"
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                  }}
                  onClick={() => handleRemoveSubstance("Stivelse")}
                  aria-label="Fjern Stivelse"
                >
                  <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }} />
                </button>
              </div>
            )}

            {otherSubstances.map((s) => {
              const label =
                OTHER_SUBSTANCE_OPTIONS.find((o) => o.value === s.name)
                  ?.label || s.name;
              return (
                <div
                  key={s.name}
                  className="d-flex align-items-stretch rounded-pill overflow-hidden"
                  style={{ fontSize: "0.85rem" }}
                >
                  <span
                    className="d-flex align-items-center px-3 py-1"
                    style={{
                      backgroundColor: "#f1f1f1",
                      color: "#333",
                    }}
                  >
                    {label} — {s.amount}g
                  </span>
                  <button
                    type="button"
                    className="d-flex align-items-center justify-content-center border-0 px-2"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                    }}
                    onClick={() => handleRemoveSubstance(s.name)}
                    aria-label={`Fjern ${label}`}
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EfsaHealthClaimsPanel;
