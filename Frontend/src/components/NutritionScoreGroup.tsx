import React from "react";

type Score = {
  letter: string;
  bg_color: string;
  color: string;
};

type NutritionScoreGroupProps = {
  highlighted?: string | null; // Letter of the score to highlight
};

const NutritionScoreGroup: React.FC<NutritionScoreGroupProps> = ({
  highlighted,
}) => {
  const scores: Score[] = [
    { letter: "A", bg_color: "#0B8A49", color: "#74AB81" }, // Dark Green
    { letter: "B", bg_color: "#72C82D", color: "#AADE80" }, // Light Green
    { letter: "C", bg_color: "#FBC705", color: "#FDDD6A" }, // Yellow
    { letter: "D", bg_color: "#F47115", color: "#F8A973" }, // Orange
    { letter: "E", bg_color: "#EF301F", color: "#F58378" }, // Red
  ];

  // If highlighted is null or undefined, set it to an empty string to prevent highlighting
  const highlightLetter = highlighted ?? "";

  return (
    <div className="d-flex align-items-center">
      {scores.map((score, index) => {
        const isHighlighted = highlightLetter === score.letter;
        return (
          <div
            key={score.letter}
            className={
              "d-flex align-items-center justify-content-center fw-bold"
            }
            style={{
              height: isHighlighted ? "30px" : "20px", // Slightly larger for highlighted
              width: isHighlighted ? "30px" : "20px",
              backgroundColor: score.bg_color,
              color: isHighlighted ? "#FFFFFF" : score.color,
              borderRadius:
                index === 0
                  ? "0.375rem 0 0 0.375rem" // Rounded left edge
                  : index === scores.length - 1
                  ? "0 0.375rem 0.375rem 0" // Rounded right edge
                  : isHighlighted
                  ? "0.375rem"
                  : "0", // No rounding for middle scores
              fontSize: "0.8rem",
              transition: "all 0.3s ease", // Smooth transition for size change
            }}
          >
            {score.letter}
          </div>
        );
      })}
    </div>
  );
};

export default NutritionScoreGroup;
