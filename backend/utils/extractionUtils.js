function findNameFromBodyContent(bodyContent, username) {
  try {
    // Split HTML into parts using the username as delimiter
    const parts = bodyContent.split(new RegExp(`\\b${username}\\b`, "gi"));
    if (parts.length < 2) return null;

    const beforeUsername = parts[0];

    // Look backwards from username position for divs containing text
    const divContents = [];

    // Find all content between > and < in the section before username
    const contentRegex = />([^<>]+)</g;
    let match;

    while ((match = contentRegex.exec(beforeUsername)) !== null) {
      const content = match[1].trim();
      if (content && content.length > 0) {
        divContents.push(content);
      }
    }

    // Get the last few meaningful contents (excluding common HTML attributes)
    // const meaningfulContents = divContents.filter((content) => {
    //   return (
    //     content.length > 1 &&
    //     content.length < 50 &&
    //     !/^(class|id|href|src|alt|title)$/i.test(content) &&
    //     !/^[0-9\s\-_.,]+$/.test(content) &&
    //     /[a-zA-Z]/.test(content)
    //   );
    // });

    // Return the last meaningful content (should be the name)
    // if (meaningfulContents.length > 0) {
    //   return meaningfulContents[meaningfulContents.length - 1];
    // }
    if (divContents.length > 0) {
      return divContents[divContents.length - 1];
    }
    return null;
  } catch (error) {
    console.log("Error finding name:", error);
    return null;
  }
}


function findDescriptionFromBodyContent(bodyContent, delimiter = "asked") {
  try {
    // Split HTML using common question delimiters
    const delimiters = [delimiter, "votes", "viewed", "modified", "asked"];
    let parts = [bodyContent];

    // Try different delimiters to find the question section
    for (const delim of delimiters) {
      const splitResult = bodyContent.split(new RegExp(`\\b${delim}\\b`, "gi"));
      if (splitResult.length >= 2) {
        parts = splitResult;
        break;
      }
    }

    // Look for description in the first part (before metadata)
    const questionSection = parts[0];

    // Extract all text content between HTML tags
    const contentRegex = />([^<>]+)</g;
    const textContents = [];
    let match;

    while ((match = contentRegex.exec(questionSection)) !== null) {
      const content = match[1].trim();
      if (content && content.length > 0) {
        textContents.push(content);
      }
    }

    // Filter for meaningful description content
    const meaningfulContents = textContents.filter((content) => {
      return (
        content.length > 10 && // Longer than typical metadata
        content.length < 500 && // Not too long to be entire page content
        !/^(class|id|href|src|alt|title|style)$/i.test(content) && // Not HTML attributes
        !/^[0-9\s\-_.,;:()]+$/.test(content) && // Not just numbers/punctuation
        /[a-zA-Z]/.test(content) && // Contains letters
        !/^(Home|Login|Register|Search|Menu)$/i.test(content) // Not navigation text
      );
    });

    // Return the longest meaningful content (likely the description)
    if (meaningfulContents.length > 0) {
      return meaningfulContents.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      );
    }

    return null;
  } catch (error) {
    console.log("Error finding description:", error);
    return null;
  }
}


module.exports = {
  findNameFromBodyContent,
  findDescriptionFromBodyContent,
};
