import React from "react";

// label + input-group(input, unit addon) — the shape every numeric field in
// the v3 calculator uses (nutrition fields, Totalt stivelse, Herav resistent,
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
}) => (
  <div style={{ minWidth: 0 }}>
    <label
      htmlFor={id}
      className={`form-label v3-label-indent${labelIcon ? " d-flex align-items-center" : ""}`}
    >
      {labelIcon}
      {label}
    </label>
    <div className="input-group">
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        className={`form-control ${error ? "is-invalid" : ""}`}
        style={{ minWidth: 0, ...invalidStyle }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="input-group-text">{unit}</span>
    </div>
  </div>
);

export default LabeledUnitInput;
