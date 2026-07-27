import React from "react";
import CustomSelect from "../CustomSelect";
import { GROUP_OPTIONS } from "../../utils/calculator/categoryOptions";

const FOOD_TYPE_OPTIONS = [
  { value: "solid", label: "Fast form" },
  { value: "liquid", label: "Flytende form" },
];

// "Legg inn næringsinnhold" — product name/image plus the matvaregruppe → matkategori
// → undermatkategori (fragment) → undermatkategori (ration) selector cascade, and the
// mattype (solid/liquid) selector. Category state itself still lives in Calculator.jsx's
// single useCalculatorState() call (it's needed elsewhere — e.g. the NutritionForm
// remount key), so this component just renders the fields against props/setters passed
// down, plus reports category changes up via onCategoryChange so the parent can clear
// any stale calculation result.
const ProductInfoSection = ({
  product,
  setProduct,
  selectedImage,
  setSelectedImage,
  handleChange,
  selectsGroup,
  setSelectGroups,
  setSelectProduct,
  setSelectFragment,
  setSelectRation,
  productOptions,
  fragmentOptions,
  rationOptions,
  foodTypeError,
  onFoodTypeChange,
  onCategoryChange,
  onResetHealthClaimsPanel,
}) => (
  <div>
    <h2 className="mb-3">Legg inn næringsinnhold</h2>
    <p className="text-muted mb-4">
      Fyll ut produktinformasjonen og næringsverdiene under for å beregne
      Nøkkelhullet og eventuelle EFSA-påstander.
    </p>

    {/* Row 1: product name + image */}
    <div className="row g-3 mb-3">
      <div className="col-12 col-md-6">
        <label htmlFor="name" className="form-label">
          Matvarenavn:
        </label>
        <input
          id="name"
          type="text"
          className="form-control"
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="Matvarenavn"
        />
      </div>
      <div className="col-12 col-md-6">
        <label htmlFor="image" className="form-label">
          Last opp profilbilde:
        </label>
        <input
          type="file"
          className="form-control"
          id="image"
          name="image"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
        />
        {selectedImage && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="img-thumbnail"
              width="150"
            />
          </div>
        )}
      </div>
    </div>

    {/* Row 2: selectors */}
    <div className="row g-3">
      <div className="col-12 col-md">
        <label className="form-label">Matvaregruppe:</label>
        <CustomSelect
          placeholder={<div>Velg matvaregruppe</div>}
          className="form-select-md"
          onChange={(e) => {
            setSelectGroups(e.value);
            setSelectProduct("");
            setSelectFragment("");
            setSelectRation("");
            onFoodTypeChange("");
            onCategoryChange();
            onResetHealthClaimsPanel();
          }}
          options={GROUP_OPTIONS}
        />
      </div>

      <div className="col-12 col-md">
        <label className="form-label">Matkategori:</label>
        <CustomSelect
          key={selectsGroup}
          placeholder={<div>Velg mat</div>}
          className="form-select-md"
          isDisabled={productOptions.length === 0}
          onChange={(e) => {
            setSelectProduct(e.value);
            setSelectFragment("");
            setSelectRation("");
            setProduct((p) => ({
              ...p,
              type: `<strong>Matkategori:</strong> ${e.label}`,
            }));
            onCategoryChange();
          }}
          options={productOptions}
        />
      </div>

      {fragmentOptions.length > 0 && (
        <div className="col-12 col-md">
          <label className="form-label">
            <strong>Undermatkategori</strong>
          </label>
          <CustomSelect
            placeholder={<div>Velg undermatkategori</div>}
            className="form-select-md"
            onChange={(e) => {
              setSelectFragment(e.value);
              setSelectRation("");
              onCategoryChange();
            }}
            options={fragmentOptions}
          />
        </div>
      )}

      {rationOptions.length > 0 && (
        <div className="col-12 col-md">
          <label className="form-label">
            <strong>Undermatkategori</strong>
          </label>
          <CustomSelect
            placeholder={<div>Velg undermatkategori</div>}
            className="form-select-md"
            onChange={(e) => {
              setSelectRation(e.value);
              setProduct((p) => ({ ...p, type: e.label }));
              onCategoryChange();
            }}
            options={rationOptions}
          />
        </div>
      )}

      <div className="col-12 col-md">
        <label htmlFor="foodType" className="form-label">
          Velg type matvare:
        </label>
        <CustomSelect
          key={selectsGroup}
          options={FOOD_TYPE_OPTIONS}
          placeholder="Velg mattype"
          onChange={(e) => onFoodTypeChange(e.value)}
        />
        {foodTypeError && (
          <div className="text-danger small mt-1">Velg mattype</div>
        )}
      </div>
    </div>
  </div>
);

export default ProductInfoSection;
