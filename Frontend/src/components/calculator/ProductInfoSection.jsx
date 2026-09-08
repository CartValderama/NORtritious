import React from "react";
import LabeledSelect from "../LabeledSelect";
import PanelBox from "../PanelBox";
import API_URL from "../../apiConfig";
import {
  GROUP_OPTIONS,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
} from "../../utils/calculator/categoryOptions";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";

const FOOD_TYPE_OPTIONS = [
  { value: "solid", label: "Fast form" },
  { value: "liquid", label: "Flytende form" },
];

const ProductInfoSection = () => {
  const {
    product,
    setProduct,
    setSelectedImage,
    selectsGroup,
    setSelectGroups,
    selectsProduct,
    setSelectProduct,
    selectsFragment,
    setSelectFragment,
    selectsRation,
    setSelectRation,
    foodType,
    foodTypeError,
    setFoodType,
    setCalculation,
    resetNutrition,
    resetEfsaValues,
    setShowHealthClaimsPanel,
  } = useCalculatorFormStore((s) => ({
    product: s.product,
    setProduct: s.setProduct,
    setSelectedImage: s.setSelectedImage,
    selectsGroup: s.selectsGroup,
    setSelectGroups: s.setSelectGroups,
    selectsProduct: s.selectsProduct,
    setSelectProduct: s.setSelectProduct,
    selectsFragment: s.selectsFragment,
    setSelectFragment: s.setSelectFragment,
    selectsRation: s.selectsRation,
    setSelectRation: s.setSelectRation,
    foodType: s.foodType,
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
            {product.productId > 0 &&
              product.imageUrl &&
              product.imageUrl !== "placeholder.png" && (
                <div className="form-text">
                  Nåværende bilde:{" "}
                  <a
                    href={`${API_URL}${product.imageUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    vis bilde
                  </a>{" "}
                  (last opp et nytt for å erstatte)
                </div>
              )}
          </div>
        </div>

        <div className="row g-4">
          <LabeledSelect
            label="Matvaregruppe"
            placeholder={<div>Velg matvaregruppe</div>}
            className="form-select-md"
            value={GROUP_OPTIONS.find((o) => o.value === selectsGroup) || null}
            onChange={(e) => {
              // Only clear the food type and any calculated result when this
              // actually replaces a prior group selection — not on the first
              // pick, which matters when editing a product whose category
              // couldn't be auto-restored (e.g. an older product saved before
              // categories were persisted): the nutrition values were already
              // loaded from the product, and picking the group to complete
              // that recovery shouldn't wipe them back out.
              const wasPreviouslySelected = Boolean(selectsGroup);
              setSelectGroups(e.value);
              setSelectProduct("");
              setSelectFragment("");
              setSelectRation("");
              if (wasPreviouslySelected) {
                setFoodType("");
                resetCalculationState();
              }
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
            value={productOptions.find((o) => o.value === selectsProduct) || null}
            onChange={(e) => {
              const wasPreviouslySelected = Boolean(selectsProduct);
              setSelectProduct(e.value);
              setSelectFragment("");
              setSelectRation("");
              setProduct((p) => ({
                ...p,
                type: `<strong>Matkategori:</strong> ${e.label}`,
              }));
              if (wasPreviouslySelected) resetCalculationState();
            }}
            options={productOptions}
          />

          {fragmentOptions.length > 0 && (
            <LabeledSelect
              label="Undermatkategori"
              placeholder={<div>Velg undermatkategori</div>}
              className="form-select-md"
              value={fragmentOptions.find((o) => o.value === selectsFragment) || null}
              onChange={(e) => {
                const wasPreviouslySelected = Boolean(selectsFragment);
                setSelectFragment(e.value);
                setSelectRation("");
                if (wasPreviouslySelected) resetCalculationState();
              }}
              options={fragmentOptions}
            />
          )}

          {rationOptions.length > 0 && (
            <LabeledSelect
              label="Undermatkategori"
              placeholder={<div>Velg undermatkategori</div>}
              className="form-select-md"
              value={rationOptions.find((o) => o.value === selectsRation) || null}
              onChange={(e) => {
                const wasPreviouslySelected = Boolean(selectsRation);
                setSelectRation(e.value);
                setProduct((p) => ({ ...p, type: e.label }));
                if (wasPreviouslySelected) resetCalculationState();
              }}
              options={rationOptions}
            />
          )}

          <LabeledSelect
            label="Velg type matvare"
            key={`foodtype-${selectsGroup}`}
            options={FOOD_TYPE_OPTIONS}
            placeholder="Velg mattype"
            value={FOOD_TYPE_OPTIONS.find((o) => o.value === foodType) || null}
            onChange={(e) => setFoodType(e.value)}
            error={foodTypeError && "Velg mattype"}
          />
        </div>
      </PanelBox>
    </div>
  );
};

export default ProductInfoSection;
