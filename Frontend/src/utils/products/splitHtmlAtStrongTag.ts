// Splits an HTML string right after its first <strong>...</strong> tag, so a
// caller can render the bolded lead-in and the rest of the text separately.
export const splitHtmlAtStrongTag = (htmlContent: string) => {
  const match = htmlContent.match(/(<strong[^>]*>.*?<\/strong>)/i);

  let before = "";
  let after = "";

  if (match) {
    const strongEndIndex = match.index! + match[0].length;
    before = htmlContent.slice(0, strongEndIndex);
    after = htmlContent.slice(strongEndIndex);

    // Ensure the first character after <strong> is uppercase
    if (after.trim().length > 0) {
      after = after.replace(
        /^(\s*)([a-z])/,
        (spaces, firstLetter) => spaces + firstLetter.toUpperCase()
      );
    }
  } else {
    before = htmlContent;
  }

  return { before, after };
};
