import React, { useEffect, useRef, useState } from "react";
import NokkelhulletResult from "./NokkelhulletResult";
import EfsaNutritionResult from "./EfsaNutritionResult";
import HealthClaimsResult from "./HealthClaimsResult";
import {
  generateResultToken,
  saveResultatDetaljer,
  clearResultatDetaljer,
} from "../../../utils/calculator/resultatDetaljerStorage";
import { buildResultSummary } from "../../../utils/calculator/nutritionResultHelpers";

// Old-design results column: stacked colored boxes (Nøkkelhullet, EFSA
// ernæringspåstander, then EFSA helsepåstander) instead of the current
// card/progress-bar layout (NutritionResult.jsx). The helsepåstander box follows
// `result` only — it stays put after Beregn even if the input panel above gets
// collapsed, and only clears on an actual Nullstill (which clears `result`).
// Shown as soon as product info (category/foodType) is filled in, same as the
// form — before a calculation has run, the three boxes below just render in
// their neutral "not calculated yet" grey state instead of this returning null.
const NutritionResult = ({ result, category, nutrition, foodType }) => {
  // Random per-session token, not a fixed/guessable URL — rotates whenever
  // the matkategori changes (a new category is a new "session" of results,
  // so an old copied link shouldn't keep working forever), clearing the
  // previous token's localStorage entry when it does.
  const [token, setToken] = useState(generateResultToken);
  const prevCategory = useRef(category);
  useEffect(() => {
    if (prevCategory.current !== category) {
      prevCategory.current = category;
      setToken((prevToken) => {
        clearResultatDetaljer(prevToken);
        return generateResultToken();
      });
    }
  }, [category]);

  // Every Beregn writes the fresh result to localStorage immediately (not just
  // when the "Se full beskrivelse" link is clicked), so an already-open detail
  // tab reflects the latest calculation via the "storage" event.
  useEffect(() => {
    if (!result) return;
    saveResultatDetaljer(token, {
      nokkelhullet: {
        category,
        nutrition,
        hasNokkelhullet: result.hasNokkelhullet === true,
      },
      efsaNutrition: {
        foodType,
        nutrition,
        efsaNutritionClaims: result.efsaNutritionClaims || [],
      },
      efsaHealth: {
        efsaHealthClaims: result.efsaHealthClaims || [],
        ingredientHealthClaims: result.ingredientHealthClaims || [],
      },
    });
  }, [token, result, category, nutrition, foodType]);

  if (!category || !foodType) return null;

  return (
    <div>
      <h2 className="mb-2">Resultat</h2>
      <p className="text-muted mb-4">
        {result ? (
          <>
            {buildResultSummary(result, foodType, category, nutrition)}{" "}
            <a
              href={`/resultat-detaljer/${token}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Se full beskrivelse her.
            </a>
          </>
        ) : (
          "EFSA-resultatene under er foreløpig begrenset til kostfiber, karbohydrat og energi."
        )}
      </p>
      <div className="d-flex flex-column gap-2">
        <NokkelhulletResult
          result={result}
          category={category}
          nutrition={nutrition}
        />
        <EfsaNutritionResult
          result={result}
          foodType={foodType}
          nutrition={nutrition}
        />
        <HealthClaimsResult result={result} />
      </div>
    </div>
  );
};

export default NutritionResult;
