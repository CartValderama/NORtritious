import React from "react";
import Accordion from "../Accordion";

// In the order the page itself runs, top to bottom, so a step and the thing it names are
// never on opposite sides of the screen from each other.
const STEPS = [
  "Velg matvaregruppe, matkategori og eventuelle undermatkategorier.",
  "Velg fysisk form (fast eller flytende).",
  "Åpne «Flere opplysninger» for porsjonsstørrelse og valg for beregningen.",
  "Fyll inn næringsinnholdet per 100 g for faste næringsmidler, eller per 100 ml for flytende næringsmidler.",
  // Adding a kilde is no longer the only way to reach a health claim: the ones whose
  // condition is a cross-reference to a næringspåstand, protein and the fat ones, are
  // answered by the nutrition table on its own. Saying otherwise would send someone
  // looking for a picker entry that does not exist for them.
  "Åpne «Beregn for helsepåstander» og legg til kilder som beta-glukan eller kalsium. " +
    "Helsepåstander som bare bygger på næringstabellen beregnes uansett.",
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
