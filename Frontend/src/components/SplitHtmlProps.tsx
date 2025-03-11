import React from "react";

interface SplitHtmlProps {
  htmlContent: string;
  part: "before" | "after"; // Choose which part to display
}

const SplitHtml: React.FC<SplitHtmlProps> = ({ htmlContent, part }) => {
  // Regular expression to find the first <strong>...</strong> including its content
  const match = htmlContent.match(/(<strong[^>]*>.*?<\/strong>)/i);

  let beforeStrong = "";
  let afterStrong = "";

  if (match) {
    // Get the index where the <strong> ends
    const strongEndIndex = match.index! + match[0].length;

    // Split the HTML
    beforeStrong = htmlContent.slice(0, strongEndIndex);
    afterStrong = htmlContent.slice(strongEndIndex);

    // Ensure the first character after <strong> is uppercase
    if (afterStrong.trim().length > 0) {
      afterStrong = afterStrong.replace(
        /^(\s*)([a-z])/,
        (match, spaces, firstLetter) => spaces + firstLetter.toUpperCase()
      );
    }
  } else {
    // If no <strong> is found, show everything in the "before" part
    beforeStrong = htmlContent;
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: part === "before" ? beforeStrong : afterStrong,
      }}
    />
  );
};

export default SplitHtml;
