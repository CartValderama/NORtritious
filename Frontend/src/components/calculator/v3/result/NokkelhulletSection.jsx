import React from "react";
import keyholeLogo from "../../../../assets/img/new_resized_image_1.png";
import { evaluateNokkelhulletRequirements } from "../../../../utils/calculator/nokkelhulletEvaluation";
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
  const passedCount = passedReqs.length;
  const allFailed = requirements.length > 0 && passedCount === 0;
  const passedFraction =
    requirements.length > 0 ? (passedCount / requirements.length) * 100 : 0;
  // Title says *how* a requirement failed (too high / too low) instead of showing the raw
  // comparator symbol; the actual numbers only appear in the natural-language description.
  const comparatorWord = (comparator) =>
    comparator === "≤" ? "høyst" : "minst";
  const directionLabel = (req) =>
    req.comparator === "≤" ? "for høyt" : "for lavt";
  const buildTitle = (req) =>
    req.passed ? req.nutrient : `${req.nutrient} (${directionLabel(req)})`;
  const buildNaturalDetail = (req) =>
    `Produktet inneholder ${req.actualValue} ${req.unit}, ${
      req.passed ? "som oppfyller kravet om" : "men kravet er"
    } ${comparatorWord(req.comparator)} ${req.thresholdValue} ${req.unit}.`;

  return (
    <div>
      <h3 className="mb-3 fs-5 d-flex align-items-end">
        <img
          src={keyholeLogo}
          alt="Nøkkelhullet"
          style={{ width: "2rem", height: "auto", marginRight: "0.75rem" }}
        />
        <span style={{ marginBottom: "0.125rem" }}>Nøkkelhullet</span>
      </h3>
      <div className="rounded bg-white result-grid gap-2">
        {/* Left: text summary, tinted to match the verdict — spans 2 rows */}
        <div
          className="px-3 py-4 rounded result-grid-left"
          style={{
            backgroundColor: passed
              ? "#0f5132"
              : allFailed
                ? "#842029"
                : "#fafafa",
            color: passed || allFailed ? "#f0faf1" : "#343a40",
          }}
        >
          {requirements.length === 0 ? (
            <p className="mb-0 px-2">
              <strong>Nøkkelhullet ukjent.</strong> Det finnes ingen spesifikke
              krav til næringsinnhold for denne kategorien.
            </p>
          ) : (
            <div className="px-2">
              {passed ? (
                <p className="mb-3">
                  <strong>Nøkkelhullet krav oppfylt.</strong> Produktet
                  oppfyller alle{" "}
                  <strong>
                    {passedCount} av {requirements.length}
                  </strong>{" "}
                  krav og kan merkes med Nøkkelhullet i denne kategorien.
                </p>
              ) : (
                <p className="mb-3">
                  <strong>Nøkkelhullet krav ikke oppfylt.</strong> Produktet
                  oppfyller{" "}
                  <strong>
                    {passedCount} av {requirements.length}
                  </strong>{" "}
                  krav, og kan ikke merkes med Nøkkelhullet før de resterende er
                  oppfylt.
                </p>
              )}

              <div
                className={`rounded-pill py-1 d-flex align-items-center justify-content-center position-relative overflow-hidden ${
                  passed
                    ? "bg-success-subtle"
                    : allFailed
                      ? "bg-white"
                      : "bg-secondary-subtle"
                }`}
              >
                <div
                  className="rounded-pill position-absolute start-0"
                  style={{
                    top: 0,
                    bottom: 0,
                    width: `${passedFraction}%`,
                    backgroundColor: passed || allFailed ? "#fff" : "#b3b3b3",
                  }}
                />
                <span
                  className="position-relative"
                  style={{
                    zIndex: 1,
                    color: passed
                      ? "#0f5132"
                      : allFailed
                        ? "#842029"
                        : "#212529",
                    fontWeight: passed || allFailed ? "bold" : undefined,
                  }}
                >
                  {Math.round(passedFraction)}% krav oppfylt
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: satisfied requirements always get their own box, so the calculator leads
            with what the product does meet — unless every requirement failed, in which case
            there's nothing satisfied to lead with, so show the failures as cards instead. */}
        {(allFailed ? failedReqs : passedReqs).map((req) => (
          <StatBox
            key={req.key}
            passed={req.passed}
            title={buildTitle(req)}
            bgClassName={
              allFailed
                ? "bg-danger-subtle"
                : failedReqs.length === 0
                  ? "bg-success-subtle"
                  : undefined
            }
          >
            {buildNaturalDetail(req)}
          </StatBox>
        ))}

        {/* Bottom row: unsatisfied requirements collapsed into one accordion — not needed
            when every requirement failed, since those are already shown as cards above. */}
        {!allFailed && failedReqs.length > 0 && (
          <SatisfiedAccordion
            label="Nøkkelhullet krav som ikke er oppfylt"
            items={failedReqs}
            passed={false}
            icon={keyholeLogo}
            renderItem={(req) => (
              <>
                <div className="d-flex align-items-start gap-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger flex-shrink-0"
                    style={{ width: "1.75rem", height: "1.75rem" }}
                  >
                    <i
                      className="bi bi-x-lg text-white"
                      style={{ fontSize: "0.9rem" }}
                    />
                  </span>
                  <span className="fw-bold">{buildTitle(req)}</span>
                </div>
                <div className="mt-2">{buildNaturalDetail(req)}</div>
              </>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default NokkelhulletSection;
