import httpClient from "./httpClient";

// Full nutrient breakdown for one food (per 100 g), returned both for search
// result rows and single-food lookup.
export interface MatvaretabellenFoodDetail {
  foodId: string;
  foodName: string;
  foodGroupId: string;
  energyKcal: number;
  energyKj: number;
  fat: number;
  saturatedFat: number;
  transFat: number;
  carbs: number;
  sugars: number;
  fibre: number;
  protein: number;
  salt: number;
  starch: number;
}

export interface MatvaretabellenSearchResult {
  items: MatvaretabellenFoodDetail[];
  totalCount: number;
  hasMore: boolean;
}

// The backend hands back one page of matches plus pagination info in response
// headers (not the body) — the dataset has 2000+ entries, so the frontend only
// asks for the next page when the user clicks "Vis flere".
export const searchMatvaretabellenFoods = async (
  query: string,
  page = 1,
  pageSize = 6,
): Promise<MatvaretabellenSearchResult> => {
  const { data, headers } = await httpClient.get<MatvaretabellenFoodDetail[]>(
    "/api/matvaretabellen/foods",
    { params: { query, page, pageSize } },
  );
  return {
    items: data,
    totalCount: Number(headers["x-total-count"] ?? data.length),
    hasMore: headers["x-has-more"] === "true",
  };
};

export const getMatvaretabellenFood = async (
  foodId: string,
): Promise<MatvaretabellenFoodDetail> => {
  const { data } = await httpClient.get<MatvaretabellenFoodDetail>(
    `/api/matvaretabellen/foods/${encodeURIComponent(foodId)}`,
  );
  return data;
};
