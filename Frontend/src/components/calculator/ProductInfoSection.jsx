import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";
import LabeledSelect from "../LabeledSelect";
import PanelBox from "../PanelBox";
import API_URL from "../../apiConfig";
// The same two marks the settings menu and the accordions themselves carry, so a switch
// and the section it governs are recognisable as the same thing.
import {
  GROUP_OPTIONS,
  PRODUCT_TYPE_BY_CATEGORY,
  PRODUCT_TYPE_ALLOWED_CATEGORIES,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
  fullkornMessageFor,
} from "../../utils/calculator/categoryOptions";
import {
  sanitizeDecimalInput,
  toDisplayDecimal,
} from "../../utils/calculator/nutritionFormFields";
import { useCalculatorFormStore } from "../../stores/calculatorFormStore";

// One stable id for the fullkorn notice, so picking a second korn category
// rewrites the one on screen instead of stacking another on top of it.
const FULLKORN_TOAST_ID = "fullkorn-krav";

// How long the notice stays up, shown as the bar down its left edge. Long enough
// to read the three clauses the deepest categories quote, and the countdown pauses
// while the pointer is over it, so a slow reader is not cut off. Restated on every
// update so picking a different category restarts the clock rather than inheriting
// what was left of the previous one's.
const FULLKORN_TOAST_MS = 12000;

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
      <ul className="warning-toast-list">
        {notice.requirements.map((requirement) => (
          <li key={requirement}>{requirement}</li>
        ))}
      </ul>
      <div className="warning-toast-note">
        Kalkulatoren kontrollerer ikke fullkorninnhold, så dette må du bekrefte
        selv.
      </div>
    </div>
  );
  // toast() with an existing id is a no-op rather than a replace, so an active
  // notice has to be updated explicitly.
  if (toast.isActive(FULLKORN_TOAST_ID)) {
    toast.update(FULLKORN_TOAST_ID, {
      render: body,
      autoClose: FULLKORN_TOAST_MS,
    });
  } else {
    toast.warn(body, {
      toastId: FULLKORN_TOAST_ID,
      className: "warning-toast",
      // Both set per toast rather than on the container, so anything raised later
      // still gets the container's defaults.
      autoClose: FULLKORN_TOAST_MS,
      hideProgressBar: false,
    });
  }
};

const FOOD_TYPE_OPTIONS = [
  { value: "solid", label: "Fast form" },
  { value: "liquid", label: "Flytende form" },
];


// What the closed band calls each product type. Separate from the picker's own options so
// the summary can stay short, and so "" reads as a product type rather than as a blank.

// Product types that can only ever be liquids. Fysisk form has a single possible answer
// for these, so it is answered rather than asked: a drikkevann left on "fast form" would
// be scored against the solid limits, 40 kcal instead of 20 and 3 g fett instead of 1,5,
// on a product that cannot be solid. Bordsøtningsmiddel is absent on purpose, since it
// comes as tablets and powder as well as drops.
// Why the band asks at all, in two lines, on the same pattern as the hover over
// Porsjonsstørrelse: what the answer is for, then what happens if it is left alone. The
// conditions themselves are in each claim's own text in the result, which is where a user
// reads them against a verdict; repeating them here made a tooltip nobody would finish.
const DECLARATION_HELP =
  "Noen påstander har et vilkår næringsinnholdet ikke kan svare på, fordi det handler " +
  "om hva som er tilsatt i produktet. Huker du ikke av, regnes ingenting som erklært, " +
  "og de påstandene kan ikke oppfylles.";

const LIQUID_ONLY_PRODUCTS = {
  drinkingWater: "Drikkevann",
  semiSkimmedMilk: "Lettmelk",
};

// The produkttyper still offered as a choice, in the order the picker shows them.
// Bordsøtningsmiddel and Drikkevann left this list when the "annet" varegruppe gave each of
// them a matkategori to follow from, and Tyggegummi is withheld with its claims. A list
// rather than one written-out option so that restoring either is a line in this array and a
// line in PRODUCT_TYPE_ALLOWED_CATEGORIES, with no new condition in the markup.
const HAND_PICKED_PRODUCT_TYPES = ["semiSkimmedMilk"];

// The mirror of LIQUID_ONLY_PRODUCTS, withheld with the Tyggegummi option it existed for.
// Restoring it means restoring solidOnlyLabel and fixedFormLabel below, the solid branch of
// the food-type effect, and the <option> further down.
//
// const SOLID_ONLY_PRODUCTS = {
//   chewingGum: "Tyggegummi",
// };


// What the hover beside the label says, for the option currently chosen. One text listing
// all four made the reader find their own case in a paragraph about three others; each of
// these names only the claims that actually move, so the hover answers the question the
// selected option raises.
const PRODUCT_TYPE_HELP = {
  "": "De fleste produkter hører hjemme her. Alle påstandene vurderes slik forskriften "
    + "skriver dem, med de vanlige grensene for fast og flytende form.",
  tableTopSweetener:
    "Lavt energiinnhold og Energifri måles per porsjon i stedet for per 100 g. "
    + "Porsjonen er mengden som tilsvarer 6 g sukrose, omtrent én teskje.",
  drinkingWater:
    "Lavt saltinnhold får grensen 2 mg natrium per 100 ml, seksti ganger strengere enn "
    + "ellers. Svært lavt saltinnhold kan ikke brukes på vann i det hele tatt, og faller "
    + "derfor ut av resultatet. Naturlig mineralvann er unntatt fra den strenge saltgrensen.",
  semiSkimmedMilk:
    "Lavt fettinnhold får grensen 1,8 g fett per 100 ml i stedet for 1,5 g. "
    + "Ingen andre påstander endrer seg.",
  // chewingGum:
  //   "Ingen næringspåstand endrer seg. Valget åpner seks EFSA-helsepåstander om tenner og "
  //   + "munnhøle, som alle krever at tyggegummien er sukkerfri, altså høyst 0,5 g "
  //   + "sukkerarter per 100 g.",
};

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
    productType,
    setProductType,
    noAddedSugarsDeclared,
    setNoAddedSugarsDeclared,
    noAddedSaltDeclared,
    setNoAddedSaltDeclared,
    portionSize,
    setEfsaField,
    usePortionFromRecipe,
    requestRecipePanelOpen,
    hasRecipe,
    showRecipePanel,
    setShowRecipePanel,
    efsaDisabled,
    setEfsaDisabled,
    setCalculation,
    resetNutrition,
    resetEfsaValues,
    resetEfsaSubstances,
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
    productType: s.productType,
    setProductType: s.setProductType,
    noAddedSugarsDeclared: s.noAddedSugarsDeclared,
    setNoAddedSugarsDeclared: s.setNoAddedSugarsDeclared,
    noAddedSaltDeclared: s.noAddedSaltDeclared,
    setNoAddedSaltDeclared: s.setNoAddedSaltDeclared,
    // The scalar rather than the efsaValues object: the store's selector is shallow, so
    // selecting the object would re-render this panel on every change inside it.
    portionSize: s.efsaValues.portionSize,
    setEfsaField: s.setEfsaField,
    // Read, not set: the recipe owns this now, and the field below only needs to know
    // whether it is being filled from there.
    usePortionFromRecipe: s.usePortionFromRecipe,
    requestRecipePanelOpen: s.requestRecipePanelOpen,
    // The length rather than the list: a boolean survives the store's shallow compare,
    // where the array would re-render this panel on every amount keystroke.
    hasRecipe: s.importedFoods.length > 0,
    showRecipePanel: s.showRecipePanel,
    setShowRecipePanel: s.setShowRecipePanel,
    efsaDisabled: s.efsaDisabled,
    setEfsaDisabled: s.setEfsaDisabled,
    setCalculation: s.setCalculation,
    resetNutrition: s.resetNutrition,
    resetEfsaValues: s.resetEfsaValues,
    resetEfsaSubstances: s.resetEfsaSubstances,
    setShowHealthClaimsPanel: s.setShowHealthClaimsPanel,
  }));
  const productOptions = PRODUCT_OPTIONS_BY_GROUP[selectsGroup] ?? [];
  const fragmentOptions = FRAGMENT_OPTIONS[selectsProduct] ?? [];
  const rationOptions = RATION_OPTIONS[selectsFragment] ?? [];

  // Everything the previous category's product described, cleared together. Porsjonsstorrelse
  // goes with resetEfsaValues; produkttype has to be said here because it lives outside
  // efsaValues. Leaving it behind let a saerregel outlive the product it was chosen for: pick
  // Drikkevann, then switch matkategori to ost, and the ost was still scored against the
  // water salt limit with nothing on screen admitting it.
  //
  // The two switches under "Valg for beregningen" are deliberately left alone. They say what
  // the user wants calculated, not what the product is, and re-enabling helsepaastander after
  // every category change would be a reset fighting the person doing the resetting.
  const resetCalculationState = () => {
    setCalculation(null);
    resetNutrition();
    resetEfsaValues();
    setProductType("");
    // For the same reason as produkttype above, and a worse one: a tick left behind from
    // the previous product grants "Uten tilsatt sukker" to the next one, and that claim
    // has no figure beside it that would look wrong.
    setNoAddedSugarsDeclared(false);
    setNoAddedSaltDeclared(false);
  };

  const portionSizeUnit = foodType === "liquid" ? "ml" : "g";

  // Closed to begin with, because most products need neither field. The three rules
  // below are what keep the collapse from hiding something that matters.
  const [footerOpen, setFooterOpen] = useState(false);
  const portionInputRef = useRef(null);
  const isSweetener = productType === "tableTopSweetener";

  // The carve-out this matkategori implies, if it implies one. Where it does, the
  // produkttype control states it rather than offering a list: the category has already
  // answered, and a second control for the same fact could be set against the first.
  const impliedProductType = PRODUCT_TYPE_BY_CATEGORY[selectsProduct];
  const PRODUCT_TYPE_LABELS = {
    tableTopSweetener: "Bordsøtningsmiddel",
    drinkingWater: "Drikkevann",
    semiSkimmedMilk: "Lettmelk",
  };

  // The hand-picked carve-outs this matkategori could honestly hold. Lettmelk is the only
  // one, and 11 a) is the only category it belongs to, so for every other category the
  // picker has nothing left to ask and is not drawn at all. The category cannot verify the
  // declaration, since 11 a) is helmelk and skummet melk too, but it can rule the question
  // out everywhere the answer would certainly be no.
  const pickableProductTypes = HAND_PICKED_PRODUCT_TYPES.filter((t) =>
    (PRODUCT_TYPE_ALLOWED_CATEGORIES[t] ?? [selectsProduct]).includes(selectsProduct),
  );
  const showProductTypePicker =
    Boolean(impliedProductType) || pickableProductTypes.length > 0;
  const liquidOnlyLabel = LIQUID_ONLY_PRODUCTS[productType];
  // const solidOnlyLabel = SOLID_ONLY_PRODUCTS[productType];
  // const fixedFormLabel = liquidOnlyLabel ?? solidOnlyLabel;
  const wasSweetener = useRef(isSweetener);

  // 1. It opens itself if a value arrives from anywhere other than this keyboard: a saved
  //    product being loaded, or the recipe filling porsjonsstørrelse from its own weight. A
  //    number that moves the verdict must not sit behind a chevron, least of all one the
  //    user never typed.
  //
  //    It used to refuse to close at all while bordsøtningsmiddel was on, to keep the
  //    porsjonsstørrelse it needs in sight. The summary does that job better: it reports the
  //    value while the band is shut, where the lock just meant the band could never be shut,
  //    so no summary was reachable at all once that switch was on.
  useEffect(() => {
    if (isSweetener || portionSize) setFooterOpen(true);
  }, [isSweetener, portionSize]);

  // Correcting rather than validating. The alternative was an error telling the user that
  // drikkevann must be flytende, which asks them to fix something only the form knows, and
  // leaves a wrong verdict reachable in the meantime if they ignore it. It also runs for a
  // foodType that arrives from elsewhere, such as a saved product being loaded back in.
  useEffect(() => {
    if (liquidOnlyLabel && foodType !== "liquid") setFoodType("liquid");
    // if (solidOnlyLabel && foodType !== "solid") setFoodType("solid");
  }, [liquidOnlyLabel, foodType, setFoodType]);

  // A produkttype the current matkategori cannot hold, cleared. Every path that changes a
  // category already clears it, so this should never fire; it is here because the failure it
  // prevents is silent. A <select> whose value matches none of its options displays the
  // first one instead, so a stale Lettmelk would read as "Vanlig næringsmiddel" on screen
  // while the 1,8 g fettgrense was still being applied behind it, and the band can be shut.
  // Cheaper to make the state unreachable than to trust three callers to keep clearing it.
  useEffect(() => {
    if (!productType || impliedProductType) return;
    if (!pickableProductTypes.includes(productType)) setProductType("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType, impliedProductType, selectsProduct]);

  // 2. Turning the switch on moves the energy limits onto a per-portion basis, so the
  //    cursor goes to the field that basis needs. Only on the switch being turned on, and
  //    only while the field is empty: re-focusing an answered field on an unrelated
  //    re-render would steal the cursor from wherever the user actually is.
  useEffect(() => {
    if (isSweetener && !wasSweetener.current && !portionSize) {
      portionInputRef.current?.focus();
    }
    wasSweetener.current = isSweetener;
  }, [isSweetener, portionSize]);

  return (
    // One card holding two things: the fields panel, and the band below it. They were
    // one element until the band became a row you hover, which needs to light up across
    // the full width of the card — impossible from inside a panel whose padding it was
    // being pulled out of. The card carries the rounding and the shadow now, and clips
    // its children to the corners, so neither child rounds itself.
    <div className="product-info-card">
      <PanelBox rounded={false} border={false}>
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
              // Re-raised even when the same category is picked again, in case
              // the user closed the notice and is coming back to re-read it. The
              // 24 and 25 requirements hold for every sub-level below them, so
              // firing on this level covers those too.
              showFullkornNotice(e.value);
              setSelectFragment("");
              setSelectRation("");
              setProduct((p) => ({
                ...p,
                type: `<strong>Matkategori:</strong> ${e.label}`,
              }));
              if (wasPreviouslySelected) resetCalculationState();
              // After the reset, which clears produkttype: a category that implies one has
              // to put it back, and a category that implies none leaves it cleared.
              setProductType(PRODUCT_TYPE_BY_CATEGORY[e.value] ?? "");
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
            label="Fysisk form"
            isDisabled={Boolean(liquidOnlyLabel)}
            hint={liquidOnlyLabel && `${liquidOnlyLabel} er alltid flytende.`}
            key={`foodtype-${selectsGroup}`}
            options={FOOD_TYPE_OPTIONS}
            placeholder="Velg fysisk form"
            value={FOOD_TYPE_OPTIONS.find((o) => o.value === foodType) || null}
            onChange={(e) => setFoodType(e.value)}
            error={foodTypeError && "Velg fysisk form"}
          />
        </div>

      </PanelBox>

      {/* A band under the cascade, behind a rule rather than in a box of its own.
          What is in here is still about the product, but not about placing it in a
          category, and porsjonsstørrelse in particular has two consumers now (the
          helsepåstander that state a gram threshold, and the per-portion energy limits
          for bordsøtningsmidler), so it cannot live inside either one's panel. */}
      <div className="product-footer">
        <button
          type="button"
          className="product-footer-toggle"
          aria-expanded={footerOpen}
          aria-controls="product-footer-fields"
          onClick={() => setFooterOpen((open) => !open)}
        >
          {/* A cog rather than a plus or a chevron: what is behind this row is the
              product's settings, and the label beside it already says that opening is what
              the click does. One glyph in both states, turned on open, so the change is
              something CSS can animate rather than a cut from one icon to another. The
              angle is in the stylesheet, keyed off this button's own aria-expanded. */}
          <i className="bi bi-gear" />
          {/* A verb, and one that swaps with the state, so the row says what clicking it
              does rather than only naming what is inside. The same pattern the
              helsepåstander accordion uses for its own header, through
              Accordion.Header.Label. */}
          <span className="product-footer-toggle-label">
            {footerOpen ? "Skjul flere opplysninger" : "Vis flere opplysninger"}
          </span>
          {/* At the far end, where the instruction accordion and the helsepåstander
              accordion both put theirs, so the three headers on this page open the same
              way to the eye. The cog on the left says what is inside; this says that the
              row opens. aria-hidden because the button's own aria-expanded already
              carries the state to a screen reader, and a second announcement of it would
              be the same fact twice. */}
          <i
            className="bi bi-chevron-down product-footer-toggle-chevron"
            aria-hidden="true"
          />
        </button>

        {/* Collapsed with grid-template-rows rather than a measured max-height, so the
            animation needs no JS and no magic number. visibility, not display: it is
            transitionable, and it takes the fields out of the tab order while shut,
            which display:none would also do but un-animatably. */}
        <div
          id="product-footer-fields"
          className={`product-footer-body${footerOpen ? " is-open" : ""}`}
        >
          <div>
            <div className="product-footer-grid">
              <div style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center gap-2 field-label-row">
                  <label
                    htmlFor="portionSize"
                    className="form-label mb-0 new-label-indent"
                  >
                    Porsjonsstørrelse
                  </label>
                  {/* Two lines, like the other hovers in this band. The sweetener case
                      gets its own, because there the figure is not a serving the producer
                      picks: the Annex ties the energy limits to the amount "with
                      equivalent sweetening properties to 6 g of sucrose". */}
                  <Tooltip
                    title={
                      isSweetener
                        ? "For bordsøtningsmidler gjelder energigrensene per porsjon, og forskriften bestemmer hvilken: mengden som er like søt som 6 g sukrose."
                        : "Noen påstander krever en oppgitt porsjonsstørrelse. Står feltet tomt, får du ikke noe resultat for dem, men ingen andre beregninger påvirkes."
                    }
                    placement="right"
                    arrow
                  >
                    <i
                      className="bi bi-info-circle text-muted"
                      style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                    />
                  </Tooltip>
                </div>
                <div className="input-group">
                  <input
                    ref={portionInputRef}
                    id="portionSize"
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    style={{ minWidth: 0 }}
                    value={toDisplayDecimal(portionSize)}
                    onChange={(e) => {
                      const sanitized = sanitizeDecimalInput(e.target.value);
                      if (sanitized !== null)
                        setEfsaField("portionSize", sanitized);
                    }}
                    placeholder="f.eks. 100"
                    disabled={usePortionFromRecipe}
                  />
                  <span className="input-group-text">{portionSizeUnit}</span>
                </div>
                {isSweetener && !usePortionFromRecipe && (
                  <div className="form-text">
                    Oppgi mengden som tilsvarer 6 g sukrose, omtrent én teskje.
                  </div>
                )}
                {/* The field is greyed out holding a figure the user never typed, and what
                    did that is an accordion further down the page. So it says so, and the
                    word that names the accordion takes you there: the mirror of the link
                    that used to point this way from the toggle. */}
                {usePortionFromRecipe && (
                  <div className="form-text">
                    Hentet fra{" "}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={requestRecipePanelOpen}
                      title="Gå til oppskriften"
                    >
                      oppskriften
                    </button>
                    .
                  </div>
                )}
              </div>

              {/* A picker, not a row of switches. The Annex's product-type carve-outs are
                  mutually exclusive, so a set of independent toggles could be put into a
                  state the regulation never contemplated, and the code would then need a
                  precedence rule for it. One value cannot contradict itself.

                  It sits with Porsjonsstørrelse rather than among the switches below
                  because it answers what the product is, not what the calculation should
                  do. */}
              {showProductTypePicker && (
              <div style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center gap-2 field-label-row">
                  <label
                    htmlFor="productType"
                    className="form-label mb-0 new-label-indent"
                  >
                    Produkt med særregler
                  </label>
                  <Tooltip
                    title={PRODUCT_TYPE_HELP[productType] ?? PRODUCT_TYPE_HELP[""]}
                    placement="right"
                    arrow
                  >
                    <i
                      className="bi bi-info-circle text-muted"
                      style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                    />
                  </Tooltip>
                </div>
                <select
                  id="productType"
                  className="form-select"
                  value={productType}
                  // Disabled rather than hidden where the category implies the value: the
                  // producer still needs to see which særregel is being applied to them,
                  // and the matkategori above is where to change it.
                  disabled={Boolean(impliedProductType)}
                  onChange={(e) => {
                    setProductType(e.target.value);
                    setCalculation(null);
                  }}
                >
                  {impliedProductType && (
                    <option value={impliedProductType}>
                      {PRODUCT_TYPE_LABELS[impliedProductType]} (følger av
                      matkategorien)
                    </option>
                  )}
                  <option value="">Vanlig næringsmiddel</option>
                  {/* Bordsøtningsmiddel and Drikkevann are set from the matkategori now,
                      by PRODUCT_TYPE_BY_CATEGORY above, because the "annet" varegruppe has
                      a category for each. The value still arrives and the særregel still
                      bites; what is gone is the second control for the same fact, which
                      could be set against the first.

                      Lettmelk has no such category and keeps its option: the Nøkkelhullet
                      taxonomy does not separate lettmelk from helmelk, which is the reason
                      this picker exists at all. It is offered in matkategori 11 a) only,
                      the one category a drinking milk can be in, which is as far as the
                      taxonomy can narrow a declaration it cannot check. See
                      PRODUCT_TYPE_ALLOWED_CATEGORIES.

                      Restoring either option means deciding which control wins when the
                      two disagree, which is the question their absence answers. */}
                  {/* <option value="tableTopSweetener">Bordsøtningsmiddel</option> */}
                  {/* <option value="drinkingWater">Drikkevann</option> */}
                  {/* <option value="chewingGum">Tyggegummi</option> */}
                  {pickableProductTypes.map((t) => (
                    <option key={t} value={t}>
                      {PRODUCT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              )}

            </div>

            <div className="product-footer-switches">
              {/* Checkboxes, not switches, and the difference is the point. A switch is a
                  setting the user can change their mind about; these two are statements
                  about the recipe that a verdict will rest on, and the Annex's own word for
                  them is a declaration. They are also the only two controls in the
                  calculator that decide a claim with no number involved, which is what the
                  heading below names them for. */}
              <div className="product-footer-group">
                <div className="d-flex align-items-center gap-2 field-label-row">
                  {/* Not "om produktet", which was true of every field in this band and so
                      drew no line, and not "om oppskriften" either: oppskrift already names
                      the Matvaretabellen panel further down, so that heading would promise
                      these two boxes were about the ingredient list in it.
                      
                      Naming the act instead of the thing avoids both. What sets these apart
                      from the næringsinnhold above is that they are about what was put in,
                      which no figure in the table can show, and that is the same sentence the
                      hover beside this heading opens with. */}
                  <div className="form-label new-label-indent mb-0">
                    Erklæringer om hva som er tilsatt
                  </div>
                  <Tooltip title={DECLARATION_HELP} placement="right" arrow>
                    <i
                      className="bi bi-info-circle text-muted"
                      style={{ cursor: "help", fontSize: "1rem", flexShrink: 0 }}
                    />
                  </Tooltip>
                </div>
                <div className="product-footer-switch-row">
                  <div className="form-check product-footer-declaration mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="noAddedSugarsDeclared"
                      checked={noAddedSugarsDeclared}
                      onChange={(e) => {
                        setNoAddedSugarsDeclared(e.target.checked);
                        setCalculation(null);
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="noAddedSugarsDeclared"
                    >
                      Ingen tilsatt sukker
                    </label>
                  </div>

                  <div className="form-check product-footer-declaration mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="noAddedSaltDeclared"
                      checked={noAddedSaltDeclared}
                      onChange={(e) => {
                        setNoAddedSaltDeclared(e.target.checked);
                        setCalculation(null);
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="noAddedSaltDeclared"
                    >
                      Ingen tilsatt natrium eller salt
                    </label>
                  </div>
                </div>
              </div>

              {/* One heading over both rather than one each. A switch is its own label, so
                  a heading per switch was the question written twice, and two of them
                  stacked read as two sections with one control apiece. */}
              <div className="product-footer-group">
                <div className="form-label new-label-indent">
                  Valg for beregningen
                </div>
                <div className="product-footer-switch-row">
                {/* What the settings menu's Matvaretabellen item did, said as a state
                    rather than an errand. Forced on while there is an ingredient list,
                    because that list fills and locks the nutrition fields below: hidden,
                    those fields would be greyed out with nothing on screen saying why. */}
                <div className="form-check form-switch form-switch-field mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showRecipePanel"
                    checked={showRecipePanel}
                    disabled={hasRecipe}
                    title={
                      hasRecipe
                        ? "Kan ikke skjules mens oppskriften har matvarer i seg"
                        : undefined
                    }
                    onChange={(e) => setShowRecipePanel(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="showRecipePanel">
                    Skal oppskriften vises nedenfor?
                  </label>
                </div>

                {/* Positive, where the settings menu's item was "Deaktiver
                    helsepåstander": a switch states what is on, and one labelled with a
                    negative is read backwards half the time. Turning it off clears what was
                    filled in and shuts the panel, the same as that menu item did. */}
                <div className="form-check form-switch form-switch-field mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="efsaHealthEnabled"
                    checked={!efsaDisabled}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setEfsaDisabled(!on);
                      if (!on) {
                        // Not resetEfsaValues: that clears porsjonsstørrelse with
                        // everything else, and that field is no longer a helsepåstander
                        // field, so this switch has no business emptying it.
                        resetEfsaSubstances();
                        setShowHealthClaimsPanel(false);
                      }
                      setCalculation(null);
                    }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="efsaHealthEnabled"
                  >
                    Skal helsepåstander beregnes?
                  </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;
