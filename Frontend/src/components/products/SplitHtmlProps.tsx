import React from "react";
import { splitHtmlAtStrongTag } from "../../utils/products/splitHtmlAtStrongTag";

interface SplitHtmlProps {
  htmlContent: string;
  part: "before" | "after"; // Choose which part to display
}

const SplitHtml: React.FC<SplitHtmlProps> = ({ htmlContent, part }) => {
  const { before, after } = splitHtmlAtStrongTag(htmlContent);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: part === "before" ? before : after,
      }}
    />
  );
};

export default SplitHtml;
