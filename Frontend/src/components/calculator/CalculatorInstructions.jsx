import React from "react";
import Accordion from "../Accordion";

const STEPS = [
  "Velg matvaregruppe, matkategori og eventuelle undermatkategorier.",
  "Velg mattype (fast eller flytende form).",
  "Fyll inn næringsinnholdet per 100 g/ml.",
  "Slå på bryteren «Vil du også beregne helsepåstander?» dersom du også vil sjekke EFSA-påstander, og fyll inn tilleggsfeltene som dukker opp.",
  "Trykk «Beregn» for å se resultatet.",
];

const CalculatorInstructions = () => (
  <Accordion
    id="calculatorInstructions"
    itemClassName="rounded-4"
    itemStyle={{
      backgroundColor: "#fff",
      border: "none",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
    }}
  >
    <Accordion.Header className="fs-6 how-to-use-toggle p-4">
      <i
        className="bi bi-question-circle me-2"
        style={{ fontSize: "1.25rem" }}
      />
      Hvordan bruke kalkulatoren
    </Accordion.Header>
    <Accordion.Body>
      <div className="accordion-body p-4" style={{ backgroundColor: "#fff" }}>
        <ol className="mb-0 ps-0" style={{ listStyle: "none" }}>
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={`d-flex align-items-start gap-2 ${i < STEPS.length - 1 ? "mb-2" : ""}`}
            >
              <i
                className={`bi bi-${i + 1}-circle-fill flex-shrink-0`}
                style={{ color: "#000000", fontSize: "1.5rem" }}
              />
              <span className="mt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Accordion.Body>
  </Accordion>
);

export default CalculatorInstructions;
