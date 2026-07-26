import { useState } from 'react';
import {
  getCategoryKey,
  PRODUCT_OPTIONS_BY_GROUP,
  FRAGMENT_OPTIONS,
  RATION_OPTIONS,
} from './data/categoryOptions';

const EMPTY_PRODUCT = {
  productId: 0, name: '', group: '', type: '',
  hasEfsaHealth: false, hasEfsaNutrition: false, hasNokkelhullet: false,
  imageUrl: 'placeholder.png',
  calories: 0, fat: 0, satFat: 0, carbs: 0,
  natSugar: 0, addedSugar: 0, fiber: 0, protein: 0, salt: 0,
};

const EMPTY_NUTRITION = {
  energikj: 0, energikcal: 0, fett: 0, mettede: 0, transfett: 0, karbohydrat: 0,
  naturligSukker: 0, hvoravSukkerarter: 0, kostfiber: 0, protein: 0,
  naturligSalt: 0, tilsattSalt: 0,
};

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [product,   setProduct]   = useState(EMPTY_PRODUCT);
  const [nutrition, setNutrition] = useState(EMPTY_NUTRITION);

  // ── Calculation state ────────────────────────────────────────────────────
  const [isCalculationCompleted, setIsCalculationCompleted] = useState(false);
  const [hasNokkelhullet,  setHasNokkelhullet]  = useState(false);
  const [hasEfsaNutrition, setHasEfsaNutrition] = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange             = (e) => { const { name, value } = e.target; setProduct(p => ({ ...p, [name]: value })); };
  const handleNutritionChange    = (updated) => setNutrition(updated);
  const handleCalculationComplete = () => setIsCalculationCompleted(true);
  const handleHasNokkelhullet    = (value) => setHasNokkelhullet(value);
  const handleEfsaNutrition      = (value) => setHasEfsaNutrition(value);

  // Builds the product payload to save. `result` is the latest calculation
  // response (see NutritionForm's onResult callback in Calculator.jsx) — the
  // EFSA health claim text (e.g. resistant starch) comes from there rather than
  // from any separate health-claims selection, since it's derived automatically
  // from the nutrition values already entered.
  const buildSubmitPayload = (result) => {
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
