import type { MatvaretabellenFoodDetail } from "../../services/matvaretabellenService";
import { EMPTY_NUTRITION, type NutritionValues } from "./nutritionFormFields";

// A food picked from Matvaretabellen, plus how much of it is in the product. The amount is
// only asked for once there is more than one food to weigh against another, so it stays
// optional and falls back to DEFAULT_AMOUNT_G below.
export interface ImportedFood extends MatvaretabellenFoodDetail {
  amount?: string;
}

// Which Matvaretabellen nutrient fills which nutrition-table field. Every key of
// EMPTY_NUTRITION is covered, so an import fills the whole table rather than the four values
// the picker happens to show in its columns. What it can't cover, because Matvaretabellen
// only holds the totals: tilsatt sukker, tilsatt salt and resistent stivelse.
//
// The five fatty-acid fields are covered too, and are the reason the form asks for them in
// grams: that is the unit the dataset states them in, so an imported figure needs no
// conversion and a typed one matches what the source would have given.
const FIELD_SOURCE: Record<string, keyof MatvaretabellenFoodDetail> = {
  energikcal: "energyKcal",
  energikj: "energyKj",
  fett: "fat",
  mettede: "saturatedFat",
  transfett: "transFat",
  karbohydrat: "carbs",
  sukkerarter: "sugars",
  kostfiber: "fibre",
  protein: "protein",
  salt: "salt",
  enumettede: "monounsaturatedFat",
  flerumettede: "polyunsaturatedFat",
  alfalinolensyre: "alphaLinolenicAcid",
  eikosapentaensyre: "eicosapentaenoicAcid",
  dokosaheksaensyre: "docosahexaenoicAcid",
};

// How many decimals a derived figure keeps, where two is not enough. The three acids are
// held to thresholds of hundredths of a gram (0,3 g for alfa-linolensyre, 0,04 g for the
// other two summed), so a two-decimal step is a quarter of the smallest limit and rounding
// half up could lift an average over a line the real figure sits under. Four decimals puts
// that error at a twentieth of a milligram.
const FIELD_DECIMALS: Record<string, number> = {
  alfalinolensyre: 4,
  eikosapentaensyre: 4,
  dokosaheksaensyre: 4,
};

// The nutrition fields an import owns. Used to lock them while the list drives them, so the
// list can't end up describing something other than the numbers beside it.
export const IMPORTED_NUTRITION_FIELDS = Object.keys(FIELD_SOURCE);

// Matvaretabellen states everything per 100 g, so a food with no stated amount is taken as
// 100 g of itself. With a single food that reproduces its values exactly, which is the
// "swap yoghurt A for yoghurt B" case; with several it makes them equal parts until real
// amounts are given.
const DEFAULT_AMOUNT_G = 100;

const DERIVED_DECIMALS = 2;

const amountOf = (food: ImportedFood): number => {
  const grams = Number(food.amount);
  return Number.isFinite(grams) && grams > 0 ? grams : DEFAULT_AMOUNT_G;
};

// What the recipe weighs in total. This is the batch, not a portion: the same product can be
// written as 900 g + 100 g or as 90 g + 10 g, so the figure is only meaningful next to the
// shares it produces. Shown under the list so a mistyped amount is visible.
export const totalGramsOf = (foods: ImportedFood[]): number =>
  foods.reduce((sum, food) => sum + amountOf(food), 0);

// How much of 100 g of the finished product is this food. The number that actually decides
// the nutrition table, which is why it's shown beside the grams rather than left implicit.
export const shareOf = (food: ImportedFood, foods: ImportedFood[]): number => {
  const total = totalGramsOf(foods);
  return total > 0 ? (amountOf(food) / total) * 100 : 0;
};

// Two decimals everywhere a figure is derived rather than typed. A weighted average produces
// as many decimals as the arithmetic happens to give, and a nutrition declaration carries
// nowhere near that precision, so the extra digits are noise that reads as accuracy.
export const roundTo = (value: number, decimals = DERIVED_DECIMALS): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// Stored with "." as the separator and shown with "," by toDisplayDecimal, the same as a
// typed value, so every Number(nutrition[key]) downstream keeps working unchanged.
const toFieldValue = (value: number, decimals = DERIVED_DECIMALS): string =>
  Number.isFinite(value) ? String(roundTo(value, decimals)) : "";

// The product's nutrition per 100 g, from the foods that make it up.
//
// Per-100 g figures can't simply be added together: three foods summed that way describe
// 300 g of food, not the product. Each food contributes value x its own grams, and the total
// is divided by the product's total weight to come back to per 100 g. With one food that
// reduces to its own values, whatever amount is given.
export const nutritionFromImportedFoods = (
  foods: ImportedFood[],
): NutritionValues => {
  if (foods.length === 0) return { ...EMPTY_NUTRITION };

  const totalGrams = foods.reduce((sum, food) => sum + amountOf(food), 0);
  if (totalGrams <= 0) return { ...EMPTY_NUTRITION };

  const nutrition: NutritionValues = { ...EMPTY_NUTRITION };
  for (const [field, source] of Object.entries(FIELD_SOURCE)) {
    const weighted = foods.reduce(
      (sum, food) => sum + (Number(food[source]) || 0) * amountOf(food),
      0,
    );
    nutrition[field] = toFieldValue(weighted / totalGrams, FIELD_DECIMALS[field]);
  }
  return nutrition;
};

// The kilder in the helsepåstander panel that Matvaretabellen can supply, and the field each
// reads. Names match the schema's kilde values, which is what routes each one into the right
// request list: calcium and vitamin D are the picker's only mineral and vitamin rows, and the
// other two are "other" substances and travel in that list instead.
//
// Four of the picker's rows, out of all of them, and the dataset is the reason rather than
// the mapping. Its 57 nutrients have no beta-glucan and no breakdown of fibre by type, so
// every fibre kilde stays hand-entered, and no food composition table holds plant sterols,
// melatonin, creatine or the rest of the isolated substances.
//
// Stivelse is the near miss: the dataset does carry it, and it is deliberately not here. A
// recipe can fill a product's total starch but never its resistant or slowly digestible
// part, and a total with a zero beside it is what 764557 reads as 0 % against a 14 %
// threshold. Filling it would tell a producer they failed a claim they never made.
const KILDE_SOURCE: Record<string, keyof MatvaretabellenFoodDetail> = {
  Calcium: "calcium",
  "Vitamin D": "vitaminD",
  "Vitamin C": "vitaminC",
  "Linoleic acid": "linoleicAcid",
};

export const RECIPE_KILDE_NAMES = Object.keys(KILDE_SOURCE);

// Weighted the same way the nutrition table is, which is the point: a kilde amount has to be
// per 100 g of the finished product, not per 100 g of the ingredient it came from. Working
// that out by hand is the mistake the Velg kilde tooltip warns about, and a recipe removes
// the need to.
//
// A nutrient the recipe has none of is left out rather than added as 0: an entry here puts a
// claim card on screen, and a card saying a product fell short of a claim nobody was making
// is noise.
export const kilderFromImportedFoods = (
  foods: ImportedFood[],
): { name: string; amount: string }[] => {
  const totalGrams = totalGramsOf(foods);
  if (foods.length === 0 || totalGrams <= 0) return [];

  return Object.entries(KILDE_SOURCE).flatMap(([name, source]) => {
    const weighted = foods.reduce(
      (sum, food) => sum + (Number(food[source]) || 0) * amountOf(food),
      0,
    );
    const perHundred = roundTo(weighted / totalGrams);
    return perHundred > 0 ? [{ name, amount: String(perHundred) }] : [];
  });
};

// The modal hands back the full picked set on save, built from search results that carry no
// amount. Merging by foodId keeps an amount the user already typed for a food that is still
// in the list, instead of silently resetting it to 100 g on every save.
export const mergeImportedFoods = (
  picked: MatvaretabellenFoodDetail[],
  existing: ImportedFood[],
): ImportedFood[] =>
  picked.map((food) => ({
    ...food,
    amount: existing.find((e) => e.foodId === food.foodId)?.amount,
  }));
