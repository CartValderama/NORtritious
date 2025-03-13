import React, { useState } from "react";

interface HealthClaimsAccordionProps {
  claims: string; // The string containing the HTML content
}

const HealthClaimsAccordion: React.FC<HealthClaimsAccordionProps> = ({
  claims,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Split the claims into individual blocks using <strong> tags as delimiters
  const claimsListItems = claims
    .split(/(<strong>.*?<\/strong>)/)
    .filter(Boolean);

  // Function to handle accordion toggle
  const handleAccordionToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionItems = []; // Store accordion items here
  let currentClaimHeading: string | null = null; // To store the current heading
  let currentClaimBody: string | null = null; // To store the current body
  let isHeading = true; // Flag to indicate whether the current part is a heading or body

  // Iterate through the split claims and process them
  claimsListItems.forEach((claim, index) => {
    // Check if the claim starts with <strong> and doesn't contain "mengde"
    if (
      claim.startsWith("<strong>") &&
      !claim.toLowerCase().includes("mengde")
    ) {
      // If there was a previous heading and body, push them as an accordion item
      if (currentClaimHeading !== null && currentClaimBody !== null) {
        accordionItems.push({
          heading: currentClaimHeading,
          body: currentClaimBody,
        });
      }
      // Set the current heading
      currentClaimHeading = claim;
      // Set the current body to the next part after the heading
      currentClaimBody = claimsListItems[index + 1] || null;
      isHeading = false; // Next claim is considered as body
    } else if (!isHeading) {
      // Append the body content if it's not a heading
      if (currentClaimBody) {
        currentClaimBody += claim; // Concatenate additional body text
      }
    }
  });

  // Add the last item if there is any remaining heading/body
  if (currentClaimHeading !== null && currentClaimBody !== null) {
    accordionItems.push({
      heading: currentClaimHeading,
      body: currentClaimBody,
    });
  }

  // Helper function to split body into sentences and render them as new lines
  const renderBody = (body: string | null) => {
    if (!body) return null;

    // Split the body into sentences (simple split by period followed by a space)
    const sentences = body
      .split(/(?<=\.)\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    return sentences.map((sentence, index) => (
      <p key={index} dangerouslySetInnerHTML={{ __html: sentence }}></p>
    ));
  };

  return (
    <div className="accordion" id="healthClaimsAccordion">
      {accordionItems.map((item, index) => (
        <div className="accordion-item" key={index}>
          <h2 className="accordion-header" id={`heading${index}`}>
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse${index}`}
              aria-expanded={activeIndex === index ? "true" : "false"}
              aria-controls={`collapse${index}`}
              onClick={() => handleAccordionToggle(index)}
            >
              <span dangerouslySetInnerHTML={{ __html: item.heading }} />
            </button>
          </h2>
          <div
            id={`collapse${index}`}
            className={`accordion-collapse collapse ${
              activeIndex === index ? "show" : ""
            }`}
            aria-labelledby={`heading${index}`}
            data-bs-parent="#healthClaimsAccordion"
          >
            <div className="accordion-body">
              {/* Render the body as a list of sentences */}
              {renderBody(item.body)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthClaimsAccordion;
