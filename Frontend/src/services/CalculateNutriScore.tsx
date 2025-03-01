// src/services/nutriScoreService.ts

export interface Product {
  productId: number;
  name: string;
  group: string;
  type: string;
  hasEfsaHealth: string;
  hasEfsaNutrition: string;
  hasNokkelhullet: boolean;
  imageUrl: string;
  // Nutrition values
  calories: number; // kJ
  fat: number; // g
  satFat: number; // g
  carbs: number; // g
  natSugar: number; // g
  addedSugar: number; // g
  fiber: number; // g
  protein: number; // g
  salt: number; // g
}

export const calculateNutriScore = (product: Product): string => {
  const { calories, fat, satFat, natSugar, addedSugar, fiber, salt } = product;

  // Negative points for undesirable ingredients
  let negativePoints = 0;

  // Calories (kJ)
  const energyPoints = Math.floor(calories / 100); // 100 kJ = 1 point

  // Fat (g)
  const fatPoints = Math.floor(fat / 10); // 10 g = 1 point

  // Saturated fat (g)
  const satFatPoints = Math.floor(satFat / 4); // 4 g = 1 point

  // Sugars (g)
  const sugarPoints = Math.floor(natSugar / 5) + Math.floor(addedSugar / 5); // 5 g = 1 point

  // Salt (g)
  const saltPoints = Math.floor(salt / 1); // 1 g = 1 point

  // Calculate negative points
  negativePoints =
    energyPoints + fatPoints + satFatPoints + sugarPoints + saltPoints;

  // Positive points for fiber
  let positivePoints = Math.floor(fiber / 3); // 3 g = 1 positive point

  // Total score: negative points minus positive points
  const totalScore = negativePoints - positivePoints;

  // Determine NutriScore based on total score
  if (totalScore <= 0) return "A";
  if (totalScore <= 10) return "B";
  if (totalScore <= 20) return "C";
  if (totalScore <= 30) return "D";
  return "E";
};
