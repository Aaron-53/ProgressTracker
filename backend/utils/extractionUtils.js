// function findNameFromBodyContent(bodyContent, username) {
//   try {
//       // Split HTML into parts using the username as delimiter
//       const parts = bodyContent.split(new RegExp(`\\b${username}\\b`, "gi"));
//     if (parts.length < 2) return null;

//     const beforeUsername = parts[0];

//     // Look backwards from username position for divs containing text
//     const divContents = [];

//     // Find all content between > and < in the section before username
//     const contentRegex = />([^<>]+)</g;
//     let match;

//     while ((match = contentRegex.exec(beforeUsername)) !== null) {
//       const content = match[1].trim();
//       if (content && content.length > 0) {
//         divContents.push(content);
//       }
//     }

//     // Get the last few meaningful contents (excluding common HTML attributes)
//     // const meaningfulContents = divContents.filter((content) => {
//     //   return (
//     //     content.length > 1 &&
//     //     content.length < 50 &&
//     //     !/^(class|id|href|src|alt|title)$/i.test(content) &&
//     //     !/^[0-9\s\-_.,]+$/.test(content) &&
//     //     /[a-zA-Z]/.test(content)
//     //   );
//     // });

//     // Return the last meaningful content (should be the name)
//     // if (meaningfulContents.length > 0) {
//     //   return meaningfulContents[meaningfulContents.length - 1];
//     // }
//     if (divContents.length > 0) {
//       return divContents[divContents.length - 1];
//     }
//     return null;
//   } catch (error) {
//     console.log("Error finding name:", error);
//     return null;
//   }
// }

const base_url = "https://leetcode.com/graphql/";
async function findName(username) {
  try {
    const response = await fetch(base_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          profile {
            realName
          }
        }
      }
    `,
        variables: {
          username: `${username}`,
        },
        operationName: 'userPublicProfile',
      }),
    })

    const data = await response.json();
    return data.data.matchedUser.profile.realName
  } catch (error) {
    console.log("Error finding name:", error);
    return null;
  }

}

async function findSubmissons(username) {
  try {
    const response = await fetch(base_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `,
        variables: {
          username: `${username}`,
          limit: 15,
        },
        operationName: 'recentAcSubmissions',
      }),
    })

    const data = await response.json();
    return data.data.recentAcSubmissionList
  } catch (error) {
    console.log("Error finding submissons:", error);
    return null;
  }
}

async function findProgress(submissions) {
  try {
    const questions = [
      { titleSlug: "two-sum", title: "Two Sum" },
      { titleSlug: "missing-number", title: "Missing Number" },
      { titleSlug: "add-two-numbers", title: "Add Two Numbers" },
      { titleSlug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists" },
      {titleSlug:"ransom-note",title:"Ransom Note"},
    ];
    const progress = [];
    for (const submission of submissions) {
      if (questions.some(q => q.titleSlug === submission.titleSlug)) {
        progress.push({ title: submission.title, timestamp: submission.timestamp, submissionId: submission.id });
      }
    }
    return progress;
  } catch (error) {
    console.log("Error finding progress:", error);
    return null;
  }
}


module.exports = {
  // findNameFromBodyContent,
  findName,
  findSubmissons,
  findProgress
};
