import { useState, type ChangeEvent } from 'react';
import {
  getCategoryKey,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
} from './categoryOptions';

interface Product {
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

type NutritionState = Record<string, number | string>;

const EMPTY_PRODUCT: Product = {
  productId: 0, name: '', group: '', type: '',
  hasEfsaHealth: false, hasEfsaNutrition: false, hasNokkelhullet: false,
  imageUrl: 'placeholder.png',
  calories: 0, fat: 0, satFat: 0, carbs: 0,
  natSugar: 0, addedSugar: 0, fiber: 0, protein: 0, salt: 0,
};

const EMPTY_NUTRITION: NutritionState = {
  energikj: 0, energikcal: 0, fett: 0, mettede: 0, transfett: 0, karbohydrat: 0,
  naturligSukker: 0, hvoravSukkerarter: 0, kostfiber: 0, protein: 0,
  naturligSalt: 0, tilsattSalt: 0,
};

interface EfsaHealthClaim {
  nutrient: string;
  meetsRequirement: string;
  pastand: string;
}

interface CalculationResult {
  efsaHealthClaims?: EfsaHealthClaim[];
}

export function useCalculatorState() {
  // ── Category selection ───────────────────────────────────────────────────
  const [selectsGroup,    setSelectGroups]   = useState('');
  const [selectsProduct,  setSelectProduct]  = useState('');
  const [selectsFragment, setSelectFragment] = useState('');
  const [selectsRation,   setSelectRation]   = useState('');

  const categoryKey     = getCategoryKey(selectsProduct, selectsFragment, selectsRation);
  const productOptions  = PRODUCT_OPTIONS_BY_GROUP[selectsGroup] ?? [];
  const fragmentOptions = FRAGMENT_OPTIONS[selectsProduct] ?? [];
  const rationOptions   = RATION_OPTIONS[selectsFragment]  ?? [];

  // ── Product metadata ─────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [product,   setProduct]   = useState<Product>(EMPTY_PRODUCT);
  const [nutrition, setNutrition] = useState<NutritionState>(EMPTY_NUTRITION);

  // ── Calculation state ────────────────────────────────────────────────────
  const [isCalculationCompleted, setIsCalculationCompleted] = useState(false);
  const [hasNokkelhullet,  setHasNokkelhullet]  = useState(false);
  const [hasEfsaNutrition, setHasEfsaNutrition] = useState<string[] | boolean | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };
  const handleNutritionChange     = (updated: NutritionState) => setNutrition(updated);
  const handleCalculationComplete = () => setIsCalculationCompleted(true);
  const handleHasNokkelhullet     = (value: boolean) => setHasNokkelhullet(value);
  const handleEfsaNutrition       = (value: string[] | boolean | null) => setHasEfsaNutrition(value);

  // Builds the product payload to save. `result` is the latest calculation
  // response (see NutritionForm's onResult callback in Calculator.jsx) — the
  // EFSA health claim text (e.g. resistant starch) comes from there rather than
  // from any separate health-claims selection, since it's derived automatically
  // from the nutrition values already entered.
  const buildSubmitPayload = (result: CalculationResult | null | undefined) => {
    const efsaHealthClaim = result?.efsaHealthClaims?.[0];
    return {
      hasNokkelhullet,
      hasEfsaNutrition,
      hasEfsaHealth: efsaHealthClaim
        ? `<strong>${efsaHealthClaim.nutrient} Helsepåstand:</strong>\n${efsaHealthClaim.meetsRequirement}\n${efsaHealthClaim.pastand}`
        : '',
      calories:   nutrition.energikcal !== '' ? nutrition.energikcal : nutrition.energikj,
      fat:        nutrition.fett,
      satFat:     nutrition.mettede,
      carbs:      nutrition.karbohydrat,
      natSugar:   nutrition.naturligSukker,
      addedSugar: nutrition.hvoravSukkerarter,
      fiber:      nutrition.kostfiber,
      protein:    nutrition.protein,
      salt:       (Number(nutrition.naturligSalt) || 0) + (Number(nutrition.tilsattSalt) || 0),
    };
  };

  return {
    // Category
    selectsGroup, setSelectGroups,
    selectsProduct, setSelectProduct,
    selectsFragment, setSelectFragment,
    selectsRation, setSelectRation,
    categoryKey, productOptions, fragmentOptions, rationOptions,
    // Product
    selectedImage, setSelectedImage,
    product, setProduct,
    nutrition,
    // Calculation
    isCalculationCompleted,
    // Handlers
    handleChange,
    handleNutritionChange,
    handleCalculationComplete,
    handleHasNokkelhullet,
    handleEfsaNutrition,
    buildSubmitPayload,
  };
}
