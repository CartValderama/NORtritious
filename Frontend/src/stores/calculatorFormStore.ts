import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { useShallow } from "zustand/react/shallow";
import {
  EMPTY_NUTRITION,
  type NutritionValues,
} from "../utils/calculator/nutritionFormFields";

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

const calculatorFormStoreBase = createStore<CalculatorFormState>((set) => ({
  nutrition: EMPTY_NUTRITION,
  setNutrition: (nutrition) => set({ nutrition }),
  setNutritionField: (key, value) =>
    set((state) => ({ nutrition: { ...state.nutrition, [key]: value } })),
  resetNutrition: () => set({ nutrition: EMPTY_NUTRITION }),

  efsaValues: EMPTY_EFSA_VALUES,
  setEfsaValues: (efsaValues) => set({ efsaValues }),
  setEfsaField: (key, value) =>
    set((state) => ({ efsaValues: { ...state.efsaValues, [key]: value } })),
  resetEfsaValues: () =>
    set((state) => ({
      efsaValues: EMPTY_EFSA_VALUES,
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
