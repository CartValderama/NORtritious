import type { CalculatorRequestPayload } from "../services/calculatorService";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { useShallow } from "zustand/react/shallow";
import {
  EMPTY_NUTRITION,
  type NutritionValues,
} from "../utils/calculator/nutritionFormFields";
import {
  kilderFromImportedFoods,
  mergeImportedFoods,
  nutritionFromImportedFoods,
  roundTo,
  totalGramsOf,
  RECIPE_KILDE_NAMES,
  type ImportedFood,
} from "../utils/calculator/importedFoodTotals";
import type { MatvaretabellenFoodDetail } from "../services/matvaretabellenService";

export interface OtherSubstance {
  name: string;
  amount: string;
}

export interface Product {
  productId: number;
  name: string;
  group: string;
  type: string;
  categoryKey: string;
  foodType: string;
  hasEfsaHealth: boolean | string;
  hasEfsaNutrition: boolean | string[] | null;
  hasNokkelhullet: boolean;
  imageUrl: string;
  calories: number | string;
  fat: number | string;
  satFat: number | string;
  carbs: number | string;
  natSugar: number | string;
  addedSugar: number | string;
  fiber: number | string;
  protein: number | string;
  salt: number | string;
  portionSize: number | string;
  totalStarch: number | string;
  resistantStarch: number | string;
  otherSubstancesJson: string;
}

const EMPTY_PRODUCT: Product = {
  productId: 0,
  name: "",
  group: "",
  type: "",
  categoryKey: "",
  foodType: "",
  hasEfsaHealth: false,
  hasEfsaNutrition: false,
  hasNokkelhullet: false,
  imageUrl: "placeholder.png",
  calories: 0,
  fat: 0,
  satFat: 0,
  carbs: 0,
  natSugar: 0,
  addedSugar: 0,
  fiber: 0,
  protein: 0,
  salt: 0,
  portionSize: 0,
  totalStarch: 0,
  resistantStarch: 0,
  otherSubstancesJson: "[]",
};

export interface EfsaPanelValues {
  totalStarch: string;
  resistantStarch: string;
  otherSubstances: OtherSubstance[];
  portionSize: string;
}

const EMPTY_EFSA_VALUES: EfsaPanelValues = {
  totalStarch: "",
  resistantStarch: "",
  otherSubstances: [],
  portionSize: "",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Calculation {
  data: any;
  nutrition: NutritionValues;
  // The inputs this result came from. Kept because the report endpoint recalculates from
  // them rather than being handed a finished result, which is what stops the document from
  // stating a verdict the calculator wouldn't reach.
  payload: CalculatorRequestPayload;
}

interface CalculatorFormState {
  // The single source of truth for the nutrition-table fields — previously
  // duplicated between useCalculatorState's own useState and NutritionForm's
  // local useState, kept in sync only by a callback prop chain. Both now read
  // and write here directly instead.
  nutrition: NutritionValues;
  setNutrition: (nutrition: NutritionValues) => void;
  setNutritionField: (key: string, value: string) => void;
  resetNutrition: () => void;

  // The recipe. It isn't a reference sitting beside the calculation: it fills the nutrition
  // table, so every action that changes it recomputes `nutrition` in the same set() rather
  // than leaving a render where the list and the numbers disagree.
  //
  // Emptying the list deliberately leaves the last computed values in the fields instead of
  // blanking them. Nothing the user can see is destroyed by removing a row, and the fields
  // unlock at the same moment, so an import can be used as a starting point and then edited
  // by hand.
  importedFoods: ImportedFood[];
  setImportedFoods: (picked: MatvaretabellenFoodDetail[]) => void;
  removeImportedFood: (foodId: string) => void;
  setImportedFoodAmount: (foodId: string, amount: string) => void;
  clearImportedFoods: () => void;

  // "Oppskriften lager én porsjon". The recipe total is a batch, not a serving: the same
  // product written as 900 g + 100 g or as 90 g + 10 g is identical, so the calculator can't
  // tell how the batch is divided up. Ticking this is the user saying the batch is one
  // portion, which is the only way that connection can be made honestly. Off by default,
  // because assuming it would check per-portion claims against a whole batch and pass claims
  // that shouldn't pass.
  usePortionFromRecipe: boolean;
  setUsePortionFromRecipe: (on: boolean) => void;

  // Bumped when something outside the recipe panel wants it opened and scrolled to — the
  // "oppskrift" link in the helsepåstander panel's Porsjon fra oppskrift label. A counter
  // rather than a boolean because the request has to fire again for a panel that is already
  // open: the useful part is then the scroll, not the opening.
  recipePanelOpenRequest: number;
  requestRecipePanelOpen: () => void;

  // Same duplication existed for the EFSA "Kilde til Annet" panel values —
  // Calculator.jsx and EfsaHealthClaimsPanel each held their own copy,
  // synced one-way via initialValues/onValuesChange. Now the single owner.
  efsaValues: EfsaPanelValues;
  setEfsaValues: (efsaValues: EfsaPanelValues) => void;
  setEfsaField: <K extends keyof EfsaPanelValues>(
    key: K,
    value: EfsaPanelValues[K],
  ) => void;
  resetEfsaValues: () => void;
  // Bumped every time resetEfsaValues runs — EfsaHealthClaimsPanel watches
  // this to clear its own local draft/UI state (newSubstance, hasStarch,
  // etc.), replacing the old key-based force-remount Calculator.jsx used
  // to do (efsaResetKey). Folding the bump into resetEfsaValues itself means
  // every caller (Nullstill, disabling EFSA, changing category) gets this
  // for free — previously only Nullstill/disable remembered to bump the key,
  // so a category change reset the store's values but left stale local UI
  // state (e.g. a "Stivelse" pill that should've disappeared) behind.
  resetToken: number;

  // These four are read by more than one sibling on the "new" calculator page
  // (ProductInfoSection/NutritionForm/NutritionResult), so they can't be
  // colocated in a single component — they used to live in Calculator.jsx
  // and get threaded down as props; now every consumer reads/writes here
  // directly and the page itself stays composition-only.
  foodType: string;
  setFoodType: (foodType: string) => void;

  foodTypeError: boolean;
  setFoodTypeError: (foodTypeError: boolean) => void;

  calculation: Calculation | null;
  setCalculation: (calculation: Calculation | null) => void;

  efsaDisabled: boolean;
  setEfsaDisabled: (efsaDisabled: boolean) => void;

  // Read by both NutritionForm (owns the Accordion) and EfsaHealthClaimsPanel
  // (its scroll-into-view-on-open effect) — previously threaded down from
  // Calculator.jsx under two different prop names (showHealthClaimsPanel /
  // isOpen) for the same value.
  showHealthClaimsPanel: boolean;
  setShowHealthClaimsPanel: (show: boolean) => void;
  toggleHealthClaimsPanel: () => void;

  selectsGroup: string;
  setSelectGroups: (value: string) => void;
  selectsProduct: string;
  setSelectProduct: (value: string) => void;
  selectsFragment: string;
  setSelectFragment: (value: string) => void;
  selectsRation: string;
  setSelectRation: (value: string) => void;

  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;

  product: Product;
  setProduct: (update: Product | ((p: Product) => Product)) => void;

  // Fed by NutritionForm's onNokkelhulletChange/onEfsaNutritionChange,
  // consumed by buildSubmitPayload when saving a product.
  hasNokkelhullet: boolean;
  setHasNokkelhullet: (value: boolean) => void;
  hasEfsaNutrition: string[] | boolean | null;
  setHasEfsaNutrition: (value: string[] | boolean | null) => void;

  // Clears every field a calculator session can accumulate, back to a blank
  // "new product" draft — used when landing on the calculator without a
  // productId, so a previous edit session's product identity (in particular
  // product.productId) can't leak into what should be a fresh create.
  resetDraft: () => void;

  // Populates the whole draft from a saved product in one atomic update, so
  // editing a product starts from that product's own data instead of
  // whatever the previous draft happened to hold.
  loadProductForEdit: (params: {
    product: Product;
    nutrition: NutritionValues;
    categoryPath: {
      group: string;
      product: string;
      fragment: string;
      ration: string;
    } | null;
    foodType: string;
    efsaValues: EfsaPanelValues;
  }) => void;
}

const portionFromRecipe = (foods: ImportedFood[]): string =>
  foods.length > 0 ? String(roundTo(totalGramsOf(foods))) : "";

// Everything the ingredient list owns, updated together. Nutrition always follows the list;
// Porsjonsstørrelse only follows it while the user has said the batch is one portion.
//
// An emptied list keeps the last computed nutrition rather than blanking it: the fields
// unlock at the same moment, so removing the last ingredient hands the numbers over to be
// edited by hand instead of throwing them away.
const applyRecipe = (
  state: CalculatorFormState,
  importedFoods: ImportedFood[],
): Partial<CalculatorFormState> => {
  const patch: Partial<CalculatorFormState> = { importedFoods };
  if (importedFoods.length > 0) {
    patch.nutrition = nutritionFromImportedFoods(importedFoods);
  }

  // Kalsium and vitamin D are kilder rather than nutrition-table fields, but they come from
  // the same foods and the same weighting, so the recipe fills them too. Any earlier
  // recipe-derived entry is replaced rather than added to; hand-picked kilder are untouched.
  const efsaValues: EfsaPanelValues = {
    ...state.efsaValues,
    otherSubstances: [
      ...state.efsaValues.otherSubstances.filter(
        (s) => !RECIPE_KILDE_NAMES.includes(s.name),
      ),
      ...kilderFromImportedFoods(importedFoods),
    ],
  };
  if (state.usePortionFromRecipe) {
    efsaValues.portionSize = portionFromRecipe(importedFoods);
  }
  patch.efsaValues = efsaValues;

  return patch;
};

const calculatorFormStoreBase = createStore<CalculatorFormState>((set) => ({
  nutrition: EMPTY_NUTRITION,
  setNutrition: (nutrition) => set({ nutrition }),
  setNutritionField: (key, value) =>
    set((state) => ({ nutrition: { ...state.nutrition, [key]: value } })),
  resetNutrition: () =>
    set({
      nutrition: EMPTY_NUTRITION,
      importedFoods: [],
      usePortionFromRecipe: false,
    }),

  importedFoods: [],
  setImportedFoods: (picked) =>
    set((state) => applyRecipe(state, mergeImportedFoods(picked, state.importedFoods))),
  removeImportedFood: (foodId) =>
    set((state) =>
      applyRecipe(state, state.importedFoods.filter((f) => f.foodId !== foodId)),
    ),
  setImportedFoodAmount: (foodId, amount) =>
    set((state) =>
      applyRecipe(
        state,
        state.importedFoods.map((f) => (f.foodId === foodId ? { ...f, amount } : f)),
      ),
    ),
  clearImportedFoods: () =>
    set((state) => ({ ...applyRecipe(state, []), usePortionFromRecipe: false })),

  recipePanelOpenRequest: 0,
  requestRecipePanelOpen: () =>
    set((state) => ({ recipePanelOpenRequest: state.recipePanelOpenRequest + 1 })),

  usePortionFromRecipe: false,
  setUsePortionFromRecipe: (usePortionFromRecipe) =>
    set((state) => ({
      usePortionFromRecipe,
      efsaValues: {
        ...state.efsaValues,
        // Switching off clears the field rather than leaving the recipe's weight behind. A
        // number the user never typed, sitting in a field they have just taken control of,
        // reads as their own answer to "how big is one portion" when it was the batch.
        portionSize: usePortionFromRecipe
          ? portionFromRecipe(state.importedFoods)
          : "",
      },
    })),

  efsaValues: EMPTY_EFSA_VALUES,
  setEfsaValues: (efsaValues) => set({ efsaValues }),
  setEfsaField: (key, value) =>
    set((state) => ({ efsaValues: { ...state.efsaValues, [key]: value } })),
  resetEfsaValues: () =>
    set((state) => ({
      efsaValues: EMPTY_EFSA_VALUES,
      // Porsjonsstørrelse is being cleared, so the recipe can't still be its source.
      usePortionFromRecipe: false,
      resetToken: state.resetToken + 1,
    })),
  resetToken: 0,

  foodType: "",
  setFoodType: (foodType) => set({ foodType }),

  foodTypeError: false,
  setFoodTypeError: (foodTypeError) => set({ foodTypeError }),

  calculation: null,
  setCalculation: (calculation) => set({ calculation }),

  efsaDisabled: false,
  setEfsaDisabled: (efsaDisabled) => set({ efsaDisabled }),

  showHealthClaimsPanel: false,
  setShowHealthClaimsPanel: (showHealthClaimsPanel) =>
    set({ showHealthClaimsPanel }),
  toggleHealthClaimsPanel: () =>
    set((state) => ({ showHealthClaimsPanel: !state.showHealthClaimsPanel })),

  selectsGroup: "",
  setSelectGroups: (selectsGroup) => set({ selectsGroup }),
  selectsProduct: "",
  setSelectProduct: (selectsProduct) => set({ selectsProduct }),
  selectsFragment: "",
  setSelectFragment: (selectsFragment) => set({ selectsFragment }),
  selectsRation: "",
  setSelectRation: (selectsRation) => set({ selectsRation }),

  selectedImage: null,
  setSelectedImage: (selectedImage) => set({ selectedImage }),

  product: EMPTY_PRODUCT,
  setProduct: (update) =>
    set((state) => ({
      product: typeof update === "function" ? update(state.product) : update,
    })),

  hasNokkelhullet: false,
  setHasNokkelhullet: (hasNokkelhullet) => set({ hasNokkelhullet }),
  hasEfsaNutrition: null,
  setHasEfsaNutrition: (hasEfsaNutrition) => set({ hasEfsaNutrition }),

  resetDraft: () =>
    set((state) => ({
      nutrition: EMPTY_NUTRITION,
      importedFoods: [],
      usePortionFromRecipe: false,
      efsaValues: EMPTY_EFSA_VALUES,
      resetToken: state.resetToken + 1,
      foodType: "",
      foodTypeError: false,
      calculation: null,
      efsaDisabled: false,
      showHealthClaimsPanel: false,
      selectsGroup: "",
      selectsProduct: "",
      selectsFragment: "",
      selectsRation: "",
      selectedImage: null,
      product: EMPTY_PRODUCT,
      hasNokkelhullet: false,
      hasEfsaNutrition: null,
    })),

  loadProductForEdit: ({ product, nutrition, categoryPath, foodType, efsaValues }) =>
    set((state) => ({
      nutrition,
      // A saved product stores its nutrition table, not the foods it was built from, so an
      // edit session starts with the fields unlocked and no list behind them.
      importedFoods: [],
      usePortionFromRecipe: false,
      efsaValues,
      resetToken: state.resetToken + 1,
      foodType,
      foodTypeError: false,
      calculation: null,
      efsaDisabled: false,
      // Auto-open when the product actually has restored panel data, so it's
      // visible right away instead of looking dropped behind a collapsed
      // accordion the user has to remember to click open.
      showHealthClaimsPanel: Boolean(
        efsaValues.totalStarch || efsaValues.otherSubstances.length > 0,
      ),
      selectsGroup: categoryPath?.group ?? "",
      selectsProduct: categoryPath?.product ?? "",
      selectsFragment: categoryPath?.fragment ?? "",
      selectsRation: categoryPath?.ration ?? "",
      selectedImage: null,
      product,
      hasNokkelhullet: product.hasNokkelhullet === true,
      hasEfsaNutrition: null,
    })),
}));

// Wraps useShallow around every call site automatically, so components can
// destructure several fields into one object selector — e.g.
// `const { selectsGroup, setSelectGroups } = useCalculatorFormStore((s) => ({
// selectsGroup: s.selectsGroup, setSelectGroups: s.setSelectGroups }))` —
// without each one needing to import useShallow itself, and without
// re-rendering on store changes outside the selected fields.
export function useCalculatorFormStore<T>(
  selector: (state: CalculatorFormState) => T,
): T {
  return useStore(calculatorFormStoreBase, useShallow(selector));
}
