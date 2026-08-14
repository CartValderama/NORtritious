import React from "react";
import OldNokkelhulletResult from "./OldNokkelhulletResult";
import OldEfsaNutritionResult from "./OldEfsaNutritionResult";
import OldHealthClaimsResult from "./OldHealthClaimsResult";

// Old-design results column: stacked colored boxes (Nøkkelhullet, EFSA
// ernæringspåstander, then EFSA helsepåstander) instead of the current
// card/progress-bar layout (NutritionResult.jsx). The helsepåstander box follows
// `result` only — it stays put after Beregn even if the input panel above gets
// collapsed, and only clears on an actual Nullstill (which clears `result`).
// Shown as soon as product info (category/foodType) is filled in, same as the
// form — before a calculation has run, the three boxes below just render in
// their neutral "not calculated yet" grey state instead of this returning null.
const OldNutritionResult = ({ result, category, nutrition, foodType }) => {
  if (!category || !foodType) return null;

  return (
    <div>
      <h2 className="mb-2">Resultat</h2>
      <p className="text-muted mb-4">
        EFSA-resultatene under er foreløpig begrenset til kostfiber, karbohydrat
        og energi.
      </p>
      <div className="d-flex flex-column gap-2">
        <OldNokkelhulletResult
          result={result}
          category={category}
          nutrition={nutrition}
        />
        <OldEfsaNutritionResult result={result} foodType={foodType} />
        <OldHealthClaimsResult result={result} />
      </div>
    </div>
  );
};

export default OldNutritionResult;
