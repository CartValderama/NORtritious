import React from "react";
import CustomSelect from "./CustomSelect";

// label + CustomSelect, in the "col-12 col-md" grid cell every selector in
// ProductInfoSection's category cascade uses — optional `error` line below,
// same shape as LabeledUnitInput's error handling.
const LabeledSelect = ({ label, error, ...selectProps }) => (
  <div className="col-12 col-md">
    <label className="form-label new-label-indent">{label}</label>
    <CustomSelect {...selectProps} />
    {error && <div className="text-danger small mt-1">{error}</div>}
  </div>
);

export default LabeledSelect;
