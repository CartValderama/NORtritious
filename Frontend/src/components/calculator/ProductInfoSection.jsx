import React from "react";
import { toast } from "react-toastify";
import LabeledSelect from "../LabeledSelect";
import PanelBox from "../PanelBox";
import API_URL from "../../apiConfig";
import {
  GROUP_OPTIONS,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
  fullkornMessageFor,
} from "../../utils/calculator/categoryOptions";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";

// One stable id for the fullkorn notice, so picking a second korn category
// rewrites the one on screen instead of stacking another on top of it.
const FULLKORN_TOAST_ID = "fullkorn-krav";

// The notice itself. The calculator has no fullkorn input and cannot check any
// of this, so it states the requirement and leaves the verifying to the user,
// worded to avoid reading as a pass.
const showFullkornNotice = (categoryValue) => {
  const notice = fullkornMessageFor(categoryValue);
  if (!notice) {
    // Picked something with no korn requirement, so any notice still up is
    // about a category the user has left.
    toast.dismiss(FULLKORN_TOAST_ID);
    return;
  }
  // One wrapper, not a fragment: the toast itself is the flex row (v11 has no
  // inner body element once you render your own content), so a fragment would
  // make the heading and the paragraph two columns beside the close button.
  //
  // The icon sits on the heading line, so it reads as part of what the notice
  // calls itself rather than as a column running down the side of the text.
  // It is Bootstrap's rather than the library's own typed one, so this carries
  // the same triangle as every other warning on the page.
  const body = (
    <div className="warning-toast-content">
      <strong className="warning-toast-heading">
        <i className="bi bi-exclamation-triangle-fill" />
        Krav til fullkorn, kategori {notice.name}
      </strong>
      <div className="mt-1">
        {notice.text}{" "}
        <span className="warning-toast-note">
          Kalkulatoren kontrollerer ikke fullkorninnhold, så dette må du
          bekrefte selv.
        </span>
      </div>
    </div>
  );
  // toast() with an existing id is a no-op rather than a replace, so an active
  // notice has to be updated explicitly.
  if (toast.isActive(FULLKORN_TOAST_ID)) {
    toast.update(FULLKORN_TOAST_ID, { render: body });
  } else {
    toast.warn(body, {
      toastId: FULLKORN_TOAST_ID,
      className: "warning-toast",
    });
  }
};

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
              toast.dismiss(FULLKORN_TOAST_ID);
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
              // Re-shown even when the same category is picked again, since the
              // notice auto-dismisses and the user may well be coming back to
              // re-read it. The 24 and 25 requirements hold for every sub-level
              // below them, so firing on this level covers those too.
              showFullkornNotice(e.value);
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

          {/* Level 4, which only category 24 reaches. Labelled differently from the
              level above because it is not the same question asked again: it picks a
              variant inside the sub-category, and the regulation sets its own
              threshold per variant. 24 a) allows 1,0 g salt for "øvrige produkter"
              but 0,5 g for stikksaltede. The level-3 value is a grouping with no
              thresholds of its own, so nothing can be checked until this is answered.
              Its options read as sentence fragments ("- for pølser likevel") that
              only make sense hanging off the level-3 label, which is the other reason
              two selects both saying "Undermatkategori" read as a duplicate. */}
          {rationOptions.length > 0 && (
            <LabeledSelect
              label="Presisering"
              placeholder={<div>Velg presisering</div>}
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
