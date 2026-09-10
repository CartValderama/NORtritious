import React from "react";
import Tooltip from "@mui/material/Tooltip";
import keyholeLogo from "../../assets/img/new_resized_image_1.png";
import banKeyhole from "../../assets/img/ban_keyhole.png";
import LabeledUnitInput from "../LabeledUnitInput";
import {
  NUTRITION_FIELDS,
  isFieldRelevant,
  isNokkelhulletField,
  isFieldFailing,
  getNokkelhulletFailureMessage,
  sanitizeDecimalInput,
  toDisplayDecimal,
} from "../../utils/calculator/nutritionFormFields";

const NutritionFieldColumn = ({
  schema,
  nutrition,
  energyUnit,
  onEnergyUnitChange,
  errors,
  calculatedNutrition,
  onFieldChange,
  // Fields currently owned by something other than the keyboard — today, the list of
  // matvarer imported from Matvaretabellen. Empty in the ordinary case.
  lockedFields = [],
}) => {
  const fields = NUTRITION_FIELDS.filter(({ key }) =>
    isFieldRelevant(key, schema),
  );
  const isLocked = (key) => lockedFields.includes(key);
  const energyLocked = isLocked(energyUnit);

  const locked = lockedFields.length > 0;

  return (
    <>
    <div
      className="d-grid gap-4 new-field-grid"
      style={{ marginBottom: locked ? "0.75rem" : "2.25rem" }}
    >
      <div style={{ minWidth: 0 }}>
        <label className="form-label new-label-indent">Energi</label>
        <div className="input-group">
          <input
            type="text"
            inputMode="decimal"
            className={`form-control ${errors.energy ? "is-invalid" : ""}`}
            style={{ minWidth: 0 }}
            placeholder="0"
            value={toDisplayDecimal(
              energyUnit === "energikcal"
                ? nutrition.energikcal
                : nutrition.energikj,
            )}
            onChange={(e) => {
              const sanitized = sanitizeDecimalInput(e.target.value);
              if (sanitized !== null) onFieldChange(energyUnit, sanitized);
            }}
            disabled={energyLocked}
          />
          <select
            className="form-select flex-grow-0 flex-shrink-0"
            style={{
              width: "4.5rem",
              padding: "0.65rem 0.25rem 0.65rem 0.6rem",
            }}
            value={energyUnit}
            onChange={(e) => onEnergyUnitChange(e.target.value)}
          >
            <option value="energikcal">kcal</option>
            <option value="energikj">kJ</option>
          </select>
        </div>
      </div>

      {fields.map(({ key, label, unit, info }) => {
        const nok = isNokkelhulletField(key, schema);
        const nokFail =
          nok &&
          calculatedNutrition != null &&
          isFieldFailing(key, schema, calculatedNutrition);
        const labelIcon = nokFail ? (
          <Tooltip
            title={getNokkelhulletFailureMessage(key, schema)}
            placement="right"
            arrow
          >
            <span
              className="icon"
              style={{ paddingRight: "0.5rem", paddingBottom: "0.125rem" }}
            >
              <img
                src={banKeyhole}
                alt="Nøkkelhullet ikke oppfylt"
                style={{ width: "1.1rem", height: "auto", cursor: "help" }}
              />
            </span>
          </Tooltip>
        ) : nok ? (
          <Tooltip
            title="Brukes i Nøkkelhullet-beregningen"
            placement="right"
            arrow
          >
            <span
              className="icon"
              style={{ paddingRight: "0.5rem", paddingBottom: "0.125rem" }}
            >
              <img
                src={keyholeLogo}
                alt="Nøkkelhullet"
                style={{ width: "1rem", height: "auto", opacity: 0.75 }}
              />
            </span>
          </Tooltip>
        ) : null;

        const labelInfo = info ? (
          <Tooltip title={info} placement="right" arrow>
            <i
              className="bi bi-info-circle text-muted ms-1"
              style={{ cursor: "help", fontSize: "0.85rem" }}
            />
          </Tooltip>
        ) : null;

        return (
          <LabeledUnitInput
            key={key}
            id={key}
            label={label}
            labelIcon={labelIcon}
            labelInfo={labelInfo}
            unit={unit}
            step="any"
            placeholder="0"
            value={nutrition[key]}
            onChange={(e) => onFieldChange(key, e.target.value)}
            error={errors[key]}
            disabled={isLocked(key)}
            invalidStyle={
              nokFail && !errors[key]
                ? { borderColor: "#dc3545", borderWidth: "2px" }
                : undefined
            }
          />
        );
      })}
    </div>

    {locked && (
      <p
        className="text-muted new-label-indent"
        style={{ fontSize: "0.8rem", marginBottom: "2.25rem" }}
      >
        <i className="bi bi-lock-fill me-1" />
        Næringsinnholdet regnes ut fra matvarene du har lagt til under. Tøm
        listen for å fylle inn verdiene selv.
      </p>
    )}
    </>
  );
};

export default NutritionFieldColumn;
