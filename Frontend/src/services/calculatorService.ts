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
  // "", "tableTopSweetener", "drinkingWater" or "semiSkimmedMilk". Picks the Annex
  // carve-out the product falls under, which rewrites the limits on the two energy claims,
  // LOW FAT or LOW SODIUM. A "chewingGum" value was added and withheld; see
  // CalculatorRequestDTO.ProductType.
  productType: string;
  // Whether the energy field was filled in, which the number alone cannot say: 0 kcal is a
  // real measurement. See CalculatorRequestDTO.EnergyEntered.
  energyEntered: boolean;
  // What the producer has declared about the recipe. "Uten tilsatt sukker" rests on the
  // first of these alone; "Uten tilsatt natrium/salt" rests on the second together with the
  // salt figure below, so a declaration on its own does not carry it. See
  // CalculatorRequestDTO.NoAddedSugarsDeclared.
  noAddedSugarsDeclared: boolean;
  noAddedSaltDeclared: boolean;
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
    // Voluntary on a label, so null where the producer has no figure. Unlike the five
    // below, a null here is read as "no polyols" rather than withholding the claim that
    // reads it, because it is a deduction from Karbohydrat rather than the subject of a
    // claim of its own. See CalculatorRequestDTO.Polyols.
    polyols: number | null;
    // Voluntary on a label, so null where the producer has no figure. The five claims that
    // read them are withheld in that case rather than failed. See
    // CalculatorRequestDTO.MonounsaturatedFat.
    monounsaturatedFat: number | null;
    polyunsaturatedFat: number | null;
    alphaLinolenicAcid: number | null;
    // Summed by the backend, since the Annex sets its limit on the sum of the two. See
    // CalculatorService.EpaPlusDha.
    eicosapentaenoicAcid: number | null;
    docosahexaenoicAcid: number | null;
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
  // True where the Nokkelhullet verdict rests on the user's confirmation of the korn
  // criterion, so the document can state that premise instead of leaving it out.
  fullkornConfirmed: boolean;
}

export const fetchCalculatorReport = async (
  payload: CalculatorReportPayload,
): Promise<Blob> => {
  const { data } = await httpClient.post("/api/calculator/report", payload, {
    responseType: "blob",
  });
  return data;
};
