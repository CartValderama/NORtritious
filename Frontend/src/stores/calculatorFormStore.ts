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

// Mirrors the Product shape in useCalculatorState.ts, which CalculatorOld.jsx
// still uses. Duplicated deliberately rather than shared — CalculatorNew is
// moving its category-selection state here while CalculatorOld stays on the
// hook, since CalculatorOld is slated for deletion later anyway.
export interface Product {
  productId: number;
  name: string;
  group: string;
  type: string;
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
}

const EMPTY_PRODUCT: Product = {
  productId: 0,
  name: "",
  group: "",
  type: "",
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
  // CalculatorNew.jsx and EfsaHealthClaimsPanel each held their own copy,
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
  // etc.), replacing the old key-based force-remount CalculatorNew.jsx used
  // to do (efsaResetKey). Folding the bump into resetEfsaValues itself means
  // every caller (Nullstill, disabling EFSA, changing category) gets this
  // for free — previously only Nullstill/disable remembered to bump the key,
  // so a category change reset the store's values but left stale local UI
  // state (e.g. a "Stivelse" pill that should've disappeared) behind.
  resetToken: number;

  // These four are read by more than one sibling on the "new" calculator page
  // (ProductInfoSection/NutritionForm/NutritionResult), so they can't be
  // colocated in a single component — they used to live in CalculatorNew.jsx
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
  // CalculatorNew.jsx under two different prop names (showHealthClaimsPanel /
  // isOpen) for the same value.
  showHealthClaimsPanel: boolean;
  setShowHealthClaimsPanel: (show: boolean) => void;
  toggleHealthClaimsPanel: () => void;

  // Category-selection cascade + product metadata for CalculatorNew only.
  // CalculatorOld.jsx keeps its own copy of this via useCalculatorState.ts's
  // per-instance useState — deliberately not shared here, since a store is a
  // single tab-wide instance and these two pages must not leak selections
  // into each other while CalculatorOld still exists.
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
