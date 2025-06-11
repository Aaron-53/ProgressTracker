const Question = require("../models/questionModel");
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
    const questions = await Question.find({},);
    const progress = [];
    for (const submission of submissions) {
      if (questions.some(q => q.titleSlug === submission.titleSlug)) {
        progress.push({question:questions.find(q => q.titleSlug === submission.titleSlug), timestamp: submission.timestamp, submissionId: submission.id });
      }
    }
    return progress;
  } catch (error) {
    console.log("Error finding progress:", error);
    return null;
  }
}


module.exports = {
  findName,
  findSubmissons,
  findProgress
};
