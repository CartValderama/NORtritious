import React from "react";
import LabeledSelect from "../../LabeledSelect";
import PanelBox from "../../PanelBox";
import {
  GROUP_OPTIONS,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
} from "../../../utils/calculator/categoryOptions";
import { useCalculatorFormStore } from "../../../stores/calculatorFormStore";

const FOOD_TYPE_OPTIONS = [
  { value: "solid", label: "Fast form" },
  { value: "liquid", label: "Flytende form" },
];

const ProductInfoSection = () => {
  const {
    product,
    setProduct,
    selectedImage,
    setSelectedImage,
    selectsGroup,
    setSelectGroups,
    selectsProduct,
    setSelectProduct,
    selectsFragment,
    setSelectFragment,
    setSelectRation,
    foodTypeError,
    setFoodType,
    setCalculation,
    resetNutrition,
    resetEfsaValues,
    setShowHealthClaimsPanel,
  } = useCalculatorFormStore((s) => ({
    product: s.product,
    setProduct: s.setProduct,
    selectedImage: s.selectedImage,
    setSelectedImage: s.setSelectedImage,
    selectsGroup: s.selectsGroup,
    setSelectGroups: s.setSelectGroups,
    selectsProduct: s.selectsProduct,
    setSelectProduct: s.setSelectProduct,
    selectsFragment: s.selectsFragment,
    setSelectFragment: s.setSelectFragment,
    setSelectRation: s.setSelectRation,
    foodTypeError: s.foodTypeError,
    setFoodType: s.setFoodType,
    setCalculation: s.setCalculation,
    resetNutrition: s.resetNutrition,
    resetEfsaValues: s.resetEfsaValues,
    setShowHealthClaimsPanel: s.setShowHealthClaimsPanel,
  }));
  const productOptions = PRODUCT_OPTIONS_BY_GROUP[selectsGroup] ?? [];
  const fragmentOptions = FRAGMENT_OPTIONS[selectsProduct] ?? [];
  const rationOptions = RATION_OPTIONS[selectsFragment] ?? [];

  const resetCalculationState = () => {
    setCalculation(null);
    resetNutrition();
    resetEfsaValues();
  };

  return (
    <div>
      <PanelBox>
        <div className="d-flex flex-column flex-md-row gap-4 gap-md-4 mb-4">
          <div className="flex-grow-1">
            <label htmlFor="name" className="form-label new-label-indent">
              Matvarenavn
            </label>
            <input
              id="name"
              type="text"
              className="form-control"
              name="name"
              value={product.name}
              onChange={(e) =>
                setProduct((p) => ({ ...p, [e.target.name]: e.target.value }))
              }
              placeholder="Skriv inn matvarenavn"
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="image" className="form-label new-label-indent">
              Last opp profilbilde
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

        <div className="row g-4">
          <LabeledSelect
            label="Matvaregruppe"
            placeholder={<div>Velg matvaregruppe</div>}
            className="form-select-md"
            onChange={(e) => {
              setSelectGroups(e.value);
              setSelectProduct("");
              setSelectFragment("");
              setSelectRation("");
              setFoodType("");
              resetCalculationState();
              setShowHealthClaimsPanel(false);
            }}
            options={GROUP_OPTIONS}
          />

          <LabeledSelect
            label="Matkategori"
            key={`matkategori-${selectsGroup}`}
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
              resetCalculationState();
            }}
            options={productOptions}
          />

          {fragmentOptions.length > 0 && (
            <LabeledSelect
              label="Undermatkategori"
              placeholder={<div>Velg undermatkategori</div>}
              className="form-select-md"
              onChange={(e) => {
                setSelectFragment(e.value);
                setSelectRation("");
                resetCalculationState();
              }}
              options={fragmentOptions}
            />
          )}

          {rationOptions.length > 0 && (
            <LabeledSelect
              label="Undermatkategori"
              placeholder={<div>Velg undermatkategori</div>}
              className="form-select-md"
              onChange={(e) => {
                setSelectRation(e.value);
                setProduct((p) => ({ ...p, type: e.label }));
                resetCalculationState();
              }}
              options={rationOptions}
            />
          )}

          <LabeledSelect
            label="Velg type matvare"
            key={`foodtype-${selectsGroup}`}
            options={FOOD_TYPE_OPTIONS}
            placeholder="Velg mattype"
            onChange={(e) => setFoodType(e.value)}
            error={foodTypeError && "Velg mattype"}
          />
        </div>
      </PanelBox>
    </div>
  );
};

export default ProductInfoSection;
