import axios from "axios";
import API_URL from "../apiConfig";

// The exact shape NutritionForm.jsx builds from its local nutrition state —
// deliberately left loose (not importing NutritionValues) since this is the
// already-converted numeric payload sent to the backend, not the raw string
// form values.
export interface CalculatorRequestPayload {
  category: string;
  foodType: string;
  energyUnit: string;
  portionSize: number;
  nutrition: {
    energyKcal: number;
    energyKj: number;
    fat: number;
    saturatedFat: number;
    transFat: number;
    carbs: number;
    naturalSugars: number;
    addedSugars: number;
    fibre: number;
    protein: number;
    salt: number;
    addedSalt: number;
    totalStarch: number;
    resistantStarch: number;
  };
  others: { name: string; amount: number }[];
}

export const calculateNutrition = async (payload: CalculatorRequestPayload) => {
  const { data } = await axios.post(
    `${API_URL}/api/calculator/calculate`,
    payload,
    { withCredentials: true },
  );
  return data;
};
