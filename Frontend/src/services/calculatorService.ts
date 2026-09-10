import httpClient from "./httpClient";

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
  // Vitamins and minerals carry a unit because theirs aren't grams (calcium is mg,
  // vitamin D is µg). The two lists are separate only because the backend DTO has them
  // separate; it checks both the same way.
  vitamins: { name: string; amount: number; unit: string }[];
  minerals: { name: string; amount: number; unit: string }[];
  others: { name: string; amount: number }[];
}

export const calculateNutrition = async (payload: CalculatorRequestPayload) => {
  const { data } = await httpClient.post("/api/calculator/calculate", payload);
  return data;
};

// What the form needs to know about a category before anything is entered. The rules live in
// the backend, so the form asks rather than keeping its own copy of them.
export interface KildeOption {
  value: string;
  label: string;
  unit: string;
  kind: "vitamin" | "mineral" | "other";
  requiresKostfiber: boolean;
  requiresPortionSize: boolean;
}

export interface CalculatorSchema {
  kilder: KildeOption[];
  fields: string[];
  nokkelhulletFields: string[];
  claims: string[];
  claimFields: Record<string, string[]>;
  thresholds: {
    maxFat?: number | null;
    maxSatFat?: number | null;
    dynamicSatFatFraction?: number | null;
    maxTotalSugars?: number | null;
    maxAddedSugars?: number | null;
    minFibre?: number | null;
    maxSalt?: number | null;
  } | null;
}

export const EMPTY_SCHEMA: CalculatorSchema = {
  kilder: [],
  fields: [],
  nokkelhulletFields: [],
  claims: [],
  claimFields: {},
  thresholds: null,
};

export const fetchCalculatorSchema = async (
  category: string,
  foodType: string,
): Promise<CalculatorSchema> => {
  const { data } = await httpClient.get("/api/calculator/schema", {
    params: { category, foodType },
  });
  return data;
};

// The report is rendered by the backend, from a calculation it runs itself, so the document
// can't state a verdict the calculator wouldn't reach for the same inputs. See
// CalculatorReportService.
export interface CalculatorReportPayload extends CalculatorRequestPayload {
  productName: string;
  matvaregruppe: string;
  efsaEnabled: boolean;
}

export const fetchCalculatorReport = async (
  payload: CalculatorReportPayload,
): Promise<Blob> => {
  const { data } = await httpClient.post("/api/calculator/report", payload, {
    responseType: "blob",
  });
  return data;
};
