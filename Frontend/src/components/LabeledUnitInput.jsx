import React from "react";
import { sanitizeDecimalInput, toDisplayDecimal } from "../utils/calculator/nutritionFormFields";

// label + input-group(input, unit addon) — the shape every numeric field in
// the "new" calculator uses (nutrition fields, Totalt stivelse, Herav resistent,
// Mengde). Energi (dual kcal/kJ unit via a <select>) and Porsjonsstørrelse
// (has its own hover-info popover) stay hand-rolled since they diverge enough
// to not be worth forcing into this shape.
const LabeledUnitInput = ({
  id,
  label,
  labelIcon,
  unit,
  value,
  onChange,
  error,
  min = "0",
  max,
  step,
  placeholder,
  disabled,
  invalidStyle,
}) => {
  const handleChange = (e) => {
    const sanitized = sanitizeDecimalInput(e.target.value);
    if (sanitized === null) return;
    onChange({ ...e, target: { ...e.target, value: sanitized } });
  };

  return (
    <div style={{ minWidth: 0 }}>
      <label
        htmlFor={id}
        className={`form-label new-label-indent${labelIcon ? " d-flex align-items-center" : ""}`}
      >
        {labelIcon}
        {label}
      </label>
      <div className="input-group">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          className={`form-control ${error ? "is-invalid" : ""}`}
          style={{ minWidth: 0, ...invalidStyle }}
          placeholder={placeholder}
          value={toDisplayDecimal(String(value ?? ""))}
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="input-group-text">{unit}</span>
      </div>
    </div>
  );
};

export default LabeledUnitInput;
