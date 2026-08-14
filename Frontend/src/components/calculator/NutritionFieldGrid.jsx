import React from "react";
import Tooltip from "@mui/material/Tooltip";
import keyholeLogo from "../../assets/img/new_resized_image_1.png";
import banKeyhole from "../../assets/img/ban_keyhole.png";
import {
  NUTRITION_FIELDS,
  isFieldRelevant,
  isNokkelhulletField,
  isFieldFailing,
  getNokkelhulletFailureMessage,
} from "../../utils/calculator/nutritionFormFields";

// Every field's label reserves this much height — tall enough to fit the Energi
// field's kcal/kJ toggle — so all inputs start at the same row regardless of
// whether a given label is plain text or has extra controls in it.
const LABEL_ROW_HEIGHT = "32px";

// Energy field + every other relevant nutrition field, flowing and wrapping instead of
// one row per nutrient, so this stays compact no matter how many fields get added over time.
const NutritionFieldGrid = ({
  category,
  nutrition,
  energyUnit,
  onEnergyUnitChange,
  errors,
  calculatedNutrition,
  onFieldChange,
}) => (
  <div className="d-grid gap-2 mt-1 nutrition-field-grid">
    {/* Energy field — unit toggle sits beside the input as one joined group
        (input grows, toggle stays compact) instead of in the label. Every label
        below reserves the same height (LABEL_ROW_HEIGHT) so this label stays
        aligned with the rest of the fields. */}
    <div style={{ minWidth: 0 }}>
      <label
        className="form-label mb-1 fw-medium"
        style={{ whiteSpace: "nowrap", height: LABEL_ROW_HEIGHT }}
      >
        Energi (kcal/kJ)
      </label>
      <div className="input-group" style={{ width: "100%" }}>
        <input
          type="number"
          min="0"
          className={`form-control ${errors.energy ? "is-invalid" : ""}`}
          placeholder={
            energyUnit === "energikcal" ? "f.eks. 250" : "f.eks. 1050"
          }
          value={
            energyUnit === "energikcal"
              ? nutrition.energikcal
              : nutrition.energikj
          }
          onChange={(e) => onFieldChange(energyUnit, e.target.value)}
        />
        <select
          className="form-select flex-grow-0 flex-shrink-0"
          style={{ width: "4.5rem" }}
          value={energyUnit}
          onChange={(e) => onEnergyUnitChange(e.target.value)}
        >
          <option value="energikcal">kcal</option>
          <option value="energikj">kJ</option>
        </select>
      </div>
    </div>

    {/* All other nutrition fields — only ones relevant to Nøkkelhullet or EFSA for this category */}
    {NUTRITION_FIELDS.filter(({ key }) => isFieldRelevant(key, category)).map(
      ({ key, label, unit, placeholder }) => {
        const nok = isNokkelhulletField(key, category);
        const nokFail =
          nok &&
          calculatedNutrition != null &&
          isFieldFailing(key, category, calculatedNutrition);
        return (
          <div key={key} style={{ minWidth: 0 }}>
            <label
              className="form-label mb-1 fw-medium d-flex align-items-center"
              style={{ whiteSpace: "nowrap", height: LABEL_ROW_HEIGHT }}
            >
              {label} ({unit})
              {nok && !nokFail && (
                <img
                  src={keyholeLogo}
                  alt="Nøkkelhullet"
                  title="Brukes i Nøkkelhullet-beregningen"
                  style={{
                    width: "18px",
                    height: "auto",
                    marginLeft: "8px",
                    verticalAlign: "middle",
                    opacity: 0.75,
                  }}
                />
              )}
              {nokFail && (
                <Tooltip
                  title={getNokkelhulletFailureMessage(key, category)}
                  placement="right"
                  arrow
                >
                  <img
                    src={banKeyhole}
                    alt="Nøkkelhullet ikke oppfylt"
                    style={{
                      width: "20px",
                      height: "auto",
                      marginLeft: "8px",
                      verticalAlign: "middle",
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              )}
            </label>
            <input
              type="number"
              min="0"
              className={`form-control ${errors[key] ? "is-invalid" : ""}`}
              style={{ width: "100%" }}
              placeholder={placeholder}
              value={nutrition[key]}
              onChange={(e) => onFieldChange(key, e.target.value)}
            />
          </div>
        );
      },
    )}
  </div>
);

export default NutritionFieldGrid;
