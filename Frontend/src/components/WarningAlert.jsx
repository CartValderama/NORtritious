import React from "react";
import { cva } from "class-variance-authority";

// "default" is the full boxed Bootstrap alert (energy mismatch, validation
// errors); "small" is the lighter inline text+icon treatment (kostfiber
// fully used) — for a warning that's expected/routine rather than something
// that needs the same visual weight as a real problem.
const containerVariants = cva("", {
  variants: {
    size: {
      default: "alert alert-warning border-0",
      small: "text-warning-emphasis small",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const WarningAlert = ({ messages, size = "default", className = "" }) => {
  const list = (Array.isArray(messages) ? messages : [messages]).filter(
    Boolean,
  );
  if (list.length === 0) return null;

  const containerClassName =
    `${containerVariants({ size })} ${className}`.trim();

  if (size === "small") {
    return (
      <div className={containerClassName}>
        {list.map((message, i) => (
          <div key={message} className={i < list.length - 1 ? "mb-1" : ""}>
            <i className="bi bi-exclamation-triangle me-1" />
            {message}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {list.map((message, i) => (
        <div
          key={message}
          className={`d-flex align-items-start gap-2 ${i < list.length - 1 ? "mb-2" : ""}`}
        >
          <i className="bi bi-exclamation-triangle flex-shrink-0 mt-1" />
          <span className="mt-1">{message}</span>
        </div>
      ))}
    </div>
  );
};

export default WarningAlert;
