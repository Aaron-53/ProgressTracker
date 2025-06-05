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
module.exports = {
  findNameFromBodyContent,
};