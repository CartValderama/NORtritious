import React, { useState } from "react";
import keyholeLogo from "../../../assets/img/new_resized_image_1.png";
import { evaluateNokkelhulletRequirements } from "../../../utils/calculator/nokkelhulletEvaluation";

// Pre-rewrite-style Nøkkelhullet box: solid green/red background, keyhole logo,
// expand/collapse chevron revealing every requirement — instead of the current
// design's split progress-bar/StatBox layout (NokkelhulletSection.jsx). Same
// underlying data (evaluateNokkelhulletRequirements, result.hasNokkelhullet).
const NokkelhulletResult = ({ result, category, nutrition }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const passed = result?.hasNokkelhullet === true;
  const requirements = result
    ? evaluateNokkelhulletRequirements(category, nutrition)
    : [];

  const canExpand = result && requirements.length > 0;

  return (
    <div
      className={
        !result
          ? "bg-secondary-subtle"
          : passed
            ? "bg-success-subtle"
            : "bg-danger-subtle"
      }
      style={{ padding: "1.5em", borderRadius: ".7em", cursor: canExpand ? "pointer" : undefined }}
      onClick={canExpand ? () => setIsExpanded((v) => !v) : undefined}
    >
      <div className={result ? "d-flex align-items-center mb-3" : "d-flex align-items-center"}>
        <img
          src={keyholeLogo}
          alt="Nøkkelhullet"
          style={{ width: "2.5rem", height: "auto", marginRight: "1em" }}
        />
        <h5 className="mb-0" style={{ minWidth: 0 }}>
          Nøkkelhullet
        </h5>
        {canExpand && (
          <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"} ms-auto`} />
        )}
      </div>
      {result && (
        <p className="mb-0">
          Produktet innfrir{" "}
          <span style={{ textDecoration: "underline" }}>
            {passed ? "alle" : "ikke alle"}
          </span>{" "}
          kravene for Nøkkelhullmerket.
        </p>
      )}
      {isExpanded && (
        <div className="mt-3 d-flex flex-column gap-1">
          {requirements.map((req) => (
            <div
              key={req.key}
              className="rounded py-2 px-3 d-flex align-items-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
            >
              {req.passed ? (
                <i className="bi bi-check-circle-fill text-success me-2 flex-shrink-0" />
              ) : (
                <i className="bi bi-x-circle-fill text-danger me-2 flex-shrink-0" />
              )}
              <span style={{ minWidth: 0 }}>
                {req.nutrient}: {req.actualValue} {req.comparator}{" "}
                {req.thresholdValue} {req.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NokkelhulletResult;
