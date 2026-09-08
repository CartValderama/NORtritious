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
  category,
  nutrition,
  energyUnit,
  onEnergyUnitChange,
  errors,
  calculatedNutrition,
  onFieldChange,
}) => {
  const fields = NUTRITION_FIELDS.filter(({ key }) =>
    isFieldRelevant(key, category),
  );

  return (
    <div
      className="d-grid gap-4 new-field-grid"
      style={{ marginBottom: "2.25rem" }}
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

      {fields.map(({ key, label, unit }) => {
        const nok = isNokkelhulletField(key, category);
        const nokFail =
          nok &&
          calculatedNutrition != null &&
          isFieldFailing(key, category, calculatedNutrition);
        const labelIcon = nokFail ? (
          <Tooltip
            title={getNokkelhulletFailureMessage(key, category)}
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

        return (
          <LabeledUnitInput
            key={key}
            id={key}
            label={label}
            labelIcon={labelIcon}
            unit={unit}
            step="any"
            placeholder="0"
            value={nutrition[key]}
            onChange={(e) => onFieldChange(key, e.target.value)}
            error={errors[key]}
            invalidStyle={
              nokFail && !errors[key]
                ? { borderColor: "#dc3545", borderWidth: "2px" }
                : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default NutritionFieldColumn;
