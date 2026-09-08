import React from "react";
import {
  evaluateNokkelhulletRequirements,
  buildRequirementTitle,
  buildRequirementDetail,
} from "../../utils/calculator/nokkelhulletEvaluation";
import ClaimGrid from "./ClaimGrid";

const NokkelhulletSection = ({ category, nutrition }) => {
  const requirements = evaluateNokkelhulletRequirements(category, nutrition);

  return (
    <ClaimGrid
      isEmpty={requirements.length === 0}
      emptyMessage={
        <>
          <strong>Nøkkelhullet ukjent.</strong> Det finnes ingen spesifikke krav
          til næringsinnhold for denne kategorien.
        </>
      }
    >
      {requirements.map((req, i) => {
        const isLastInRow = i % 2 === 1 || i === requirements.length - 1;
        const rows = Math.ceil(requirements.length / 2);
        const isLastRow = i >= (rows - 1) * 2;

        return (
          <div
            key={req.key}
            className={`claim-grid-item p-4 ${!isLastInRow ? "border-end" : ""} ${!isLastRow ? "border-bottom" : ""}`}
            style={{ paddingRight: !isLastInRow ? "1rem" : 0 }}
          >
            <p
              className={`mb-2 fw-bold d-flex align-items-center gap-2 ${req.passed ? "text-success-emphasis" : "text-danger-emphasis"}`}
            >
              <i
                className={`bi ${req.passed ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}
                style={{
                  color: req.passed ? "#198754" : "#dc3545",
                  fontSize: "1rem",
                }}
              />
              {buildRequirementTitle(req)}
            </p>
            <p
              className="mb-0"
              style={{ color: req.passed ? "#062814" : "#3b0c0f" }}
            >
              {buildRequirementDetail(req)}
            </p>
          </div>
        );
      })}
    </ClaimGrid>
  );
};

export default NokkelhulletSection;
