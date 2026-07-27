import React from "react";
import keyholeLogo from "../../../assets/img/new_resized_image_1.png";
import { evaluateNokkelhulletRequirements } from "../../../utils/calculator/nokkelhulletEvaluation";
import StatBox from "./StatBox";
import SatisfiedAccordion from "./SatisfiedAccordion";

// Part 1 — Nøkkelhullet: overall verdict plus every requirement for this category, each
// marked pass/fail individually (not just the failing ones).
const NokkelhulletSection = ({ result, category, nutrition }) => {
  const requirements = evaluateNokkelhulletRequirements(category, nutrition);
  const passed = result.hasNokkelhullet === true;
  const failed = result.hasNokkelhullet === false;
  const failedReqs = requirements.filter((r) => !r.passed);
  const passedReqs = requirements.filter((r) => r.passed);
  const failedCount = failedReqs.length;
  const passedCount = passedReqs.length;
  const passedFraction =
    requirements.length > 0 ? (passedCount / requirements.length) * 100 : 0;
  const renderReqDetail = (req) => (
    <>
      {req.actualValue} {req.comparator} {req.thresholdValue} {req.unit}
    </>
  );

  return (
    <div>
      <h3 className="mb-3 d-flex align-items-center">
        <img
          src={keyholeLogo}
          alt="Nøkkelhullet"
          style={{ width: "2.5rem", height: "auto", marginRight: "0.75rem" }}
        />
        Nøkkelhullet
      </h3>
      <div className="rounded bg-white result-grid">
        {/* Left: text summary, tinted to match the verdict — spans 2 rows */}
        <div
          className="px-3 py-4 rounded result-grid-left"
          style={{
            backgroundColor: passed
              ? "#0f5132"
              : failed
                ? "#fafafa"
                : "#fafafa",
            color: passed ? "#f0faf1" : "#343a40",
          }}
        >
          <div className="d-flex justify-content-start mb-3">
            <span
              className={`badge rounded-pill fs-6 ${
                passed ? "bg-success" : failed ? "bg-danger" : "bg-secondary"
              }`}
            >
              <i
                className={`bi ${passed ? "bi-check-circle" : failed ? "bi-x-circle" : "bi-question-circle"} me-1`}
              />
              {passed
                ? "Nøkkelhullet krav oppfylt"
                : failed
                  ? "Nøkkelhullet krav ikke oppfylt"
                  : "Nøkkelhullet ukjent"}
            </span>
          </div>

          {requirements.length === 0 ? (
            <p className="mb-0 px-2 mt-4">
              Det finnes ingen spesifikke krav til næringsinnhold for denne
              kategorien.
            </p>
          ) : (
            <div className="px-2 mt-4">
              <div className="d-flex align-items-baseline mb-2">
                <span
                  className="fw-bold"
                  style={{ fontSize: "2.5rem", lineHeight: 1 }}
                >
                  {passedCount}
                </span>
                <span className="fs-5" style={{ opacity: 0.85 }}>
                  / {requirements.length} krav oppfylt
                </span>
              </div>
              <div
                className="rounded-pill mb-3"
                style={{
                  height: "0.5rem",
                  backgroundColor: passed
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.15)",
                }}
              >
                <div
                  className="rounded-pill h-100"
                  style={{
                    width: `${passedFraction}%`,
                    backgroundColor: passed ? "#fff" : "#6c757d",
                  }}
                />
              </div>

              {passed ? (
                <p className="mb-0">
                  Produktet oppfyller{" "}
                  <strong>alle {requirements.length}</strong> krav for
                  Nøkkelhullet i denne kategorien.
                </p>
              ) : (
                <p className="mb-0">
                  Produktet oppfyller ikke <strong>{failedCount}</strong> av{" "}
                  <strong>{requirements.length}</strong> krav for Nøkkelhullet i
                  denne kategorien. Se statistikken til høyre for hvilke krav
                  som ikke er innfridd.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: failed requirements get their own box. If nothing failed, show the
            satisfied ones as boxes too instead of hiding everything behind the accordion. */}
        {(failedReqs.length > 0 ? failedReqs : passedReqs).map((req) => (
          <StatBox
            key={req.key}
            passed={req.passed}
            title={req.nutrient}
            statLine={renderReqDetail(req)}
          >
            {req.description}
          </StatBox>
        ))}

        {/* Bottom row: satisfied requirements collapsed into one accordion — only needed
            when there are also failed ones shown above; otherwise they're already boxes. */}
        {failedReqs.length > 0 && (
          <SatisfiedAccordion
            label="Krav som er oppfylt"
            logo={keyholeLogo}
            items={passedReqs}
            renderItem={(req) => (
              <>
                <div>
                  <span className="fw-bold">{req.nutrient}:</span>{" "}
                  {renderReqDetail(req)}
                </div>
                <div>{req.description}</div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default NokkelhulletSection;
