import React from "react";
import Tooltip from "@mui/material/Tooltip";
import keyholeLogo from "../../../assets/img/new_resized_image_1.png";
import banKeyhole from "../../../assets/img/ban_keyhole.png";
import {
  NUTRITION_FIELDS,
  isFieldRelevant,
  isNokkelhulletField,
  isFieldFailing,
  getNokkelhulletFailureMessage,
} from "../../../utils/calculator/nutritionFormFields";

// Table-based nutrition input, styled after the pre-rewrite per-category calculator
// (table-striped rows, "Energi eller næringsstoff" / "Mengde" columns, failing rows
// outlined via .alert-box) — but driven by the same generic field config/validation
// helpers the current card-grid version (NutritionFieldGrid) uses, so category behaviour
// stays identical between the two designs.
const OldNutritionFieldTable = ({
  category,
  nutrition,
  energyUnit,
  onEnergyUnitChange,
  errors,
  calculatedNutrition,
  onFieldChange,
}) => (
  <table
    className="table table-striped nutrition-table mb-0"
    style={{
      width: "100%",
      tableLayout: "fixed",
      borderCollapse: "separate",
      borderSpacing: 0,
      overflow: "hidden",
      borderRadius: "0.7em",
    }}
  >
    <thead>
      <tr>
        <th scope="col" className="table-font py-2 px-4">
          Energi eller næringsstoff
        </th>
        <th scope="col" className="table-font py-2 px-4">
          <div className="ms-auto">Mengde</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row" className="table-font fw-normal py-2 px-4">
          Energi (kcal/kJ)
        </th>
        <td className="py-2 px-4">
          <div className="input-group ms-auto" style={{ width: "100%" }}>
            <input
              type="number"
              min="0"
              step="any"
              className={`form-control ${errors.energy ? "is-invalid" : ""}`}
              value={
                energyUnit === "energikcal"
                  ? nutrition.energikcal
                  : nutrition.energikj
              }
              onChange={(e) => onFieldChange(energyUnit, e.target.value)}
            />
            <select
              className="form-select flex-grow-0 flex-shrink-0"
              style={{ width: "5rem" }}
              value={energyUnit}
              onChange={(e) => onEnergyUnitChange(e.target.value)}
            >
              <option value="energikcal">kcal</option>
              <option value="energikj">kJ</option>
            </select>
          </div>
        </td>
      </tr>

      {NUTRITION_FIELDS.filter(({ key }) => isFieldRelevant(key, category)).map(
        ({ key, label, unit, placeholder }) => {
          const nok = isNokkelhulletField(key, category);
          const nokFail =
            nok &&
            calculatedNutrition != null &&
            isFieldFailing(key, category, calculatedNutrition);
          return (
            <tr key={key}>
              <th scope="row" className="table-font fw-normal py-2 px-4">
                {nokFail ? (
                  <Tooltip
                    title={getNokkelhulletFailureMessage(key, category)}
                    placement="right"
                    arrow
                  >
                    <span className="icon" style={{ paddingRight: "0.5rem" }}>
                      <img
                        src={banKeyhole}
                        alt="Nøkkelhullet ikke oppfylt"
                        style={{
                          width: "1.5rem",
                          height: "auto",
                          cursor: "help",
                        }}
                      />
                    </span>
                  </Tooltip>
                ) : nok ? (
                  <Tooltip
                    title="Brukes i Nøkkelhullet-beregningen"
                    placement="right"
                    arrow
                  >
                    <span className="icon" style={{ paddingRight: "0.5rem" }}>
                      <img
                        src={keyholeLogo}
                        alt="Nøkkelhullet"
                        style={{
                          width: "1.25rem",
                          height: "auto",
                          opacity: 0.75,
                        }}
                      />
                    </span>
                  </Tooltip>
                ) : null}
                {label} ({unit})
              </th>
              <td className="py-2 px-4">
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={`form-control ms-auto ${errors[key] ? "is-invalid" : ""}`}
                  style={{
                    width: "100%",
                    ...(nokFail && !errors[key]
                      ? { borderColor: "#dc3545", borderWidth: "2px" }
                      : {}),
                  }}
                  placeholder={placeholder}
                  value={nutrition[key]}
                  onChange={(e) => onFieldChange(key, e.target.value)}
                />
              </td>
            </tr>
          );
        },
      )}
    </tbody>
  </table>
);

export default OldNutritionFieldTable;
