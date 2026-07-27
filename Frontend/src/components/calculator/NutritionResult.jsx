import React from "react";
import NokkelhulletSection from "./result/NokkelhulletSection";
import EfsaSection from "./result/EfsaSection";
import HealthClaimsSection from "./result/HealthClaimsSection";
import {
  buildResultSummary,
  getEnergyMismatchWarning,
  getEnergyFormulaWarning,
} from "../../utils/calculator/nutritionResultHelpers";

const NutritionResult = ({
  result,
  category,
  nutrition,
  foodType,
  showHealthClaimsPanel,
}) => {
  if (!result) return null;

  const energyMismatchWarning = getEnergyMismatchWarning(nutrition, foodType);
  const energyFormulaWarning = getEnergyFormulaWarning(nutrition, foodType);

  return (
    <div>
      <h2 className="mb-1">Resultat</h2>
      <p className="text-muted mb-3">{buildResultSummary(result, foodType)}</p>
      {(energyMismatchWarning || energyFormulaWarning) && (
        <div className="alert alert-warning border-0 mb-4">
          {energyMismatchWarning && (
            <div className="d-flex align-items-start gap-2 mb-2">
              <i className="bi bi-exclamation-triangle flex-shrink-0 mt-1" />
              <span className="mt-1">{energyMismatchWarning}</span>
            </div>
          )}
          {energyFormulaWarning && (
            <div className="d-flex align-items-start gap-2">
              <i className="bi bi-exclamation-triangle flex-shrink-0 mt-1" />
              <span className="mt-1">{energyFormulaWarning}</span>
            </div>
          )}
        </div>
      )}
      <div className="d-flex flex-column gap-5">
        <NokkelhulletSection
          result={result}
          category={category}
          nutrition={nutrition}
        />
        <EfsaSection
          result={result}
          nutrition={nutrition}
          foodType={foodType}
        />
        {showHealthClaimsPanel && <HealthClaimsSection result={result} />}
      </div>
    </div>
  );
};

export default NutritionResult;
