export interface Product {
    productId: number;
    name: string; 
    group: string;
    type: string;
    categoryKey: string;
    foodType: string;
    hasEfsaHealth: string; // EFSA Health Claim, will not be boolean
    hasEfsaNutrition: string; // Will not be boolean
    hasNokkelhullet: boolean; // Will not be boolean
    imageUrl: string;

    // Nutrition Values, 
    // these could be stored as one object
    calories: number;
    fat: number;
    satFat: number;
    carbs: number;
    natSugar: number;
    addedSugar: number;
    fiber: number;
    protein: number;
    salt: number;
}