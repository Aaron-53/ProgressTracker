// const Question = require("../models/questionModel");
const User = require("../models/userModel");
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
          statusDisplay
          lang
        }
      }
    `,
        variables: {
          username: `${username}`,
          limit: 20,
        },
        operationName: 'recentAcSubmissions',
      }),
    })

    const data = await response.json();
    return data.data.recentAcSubmissionList
  } catch (error) {
    return null;
  }
}

async function findProgress(submissions) {
  try {
    const progress = [];
    for (const submission of submissions) {
        progress.push({
          // question:await Question.findOne({ titleSlug: submission.titleSlug }) || null,
          titleSlug: submission.titleSlug || submission.title_slug,
          timestamp: submission.timestamp,
          submissionId: submission.id,
          status: submission.statusDisplay || submission.status_display,
          language: submission.lang
        });
      
    }
    return progress;
  } catch (error) {
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findAllSubmissions(leetcodeSession, csrfToken, username) {
  const user = await User.findOne({ username });
  if (!user) {
    console.error(`User ${username} not found`);
    return;
  }

  let offset = 0;
  const limit = 20;
  let submissions = await fetchSubmissionsUsingToken(leetcodeSession, csrfToken, offset, limit);

  while (submissions && submissions.submissions_dump.length > 0) {
    const progress = await findProgress(submissions.submissions_dump);

    if (JSON.stringify(user.solvedQuestions) !== JSON.stringify(progress)) {
      user.solvedQuestions = [...user.solvedQuestions, ...progress];
      await user.save();
    }

    if (!submissions.has_next) break;

    offset += limit;
    await sleep(1000);
    submissions = await fetchSubmissionsUsingToken(leetcodeSession, csrfToken, offset, limit);
  }
}


async function fetchSubmissionsUsingToken(leetcodeSession, csrfToken,offset, limit) {
  try {
    const response = await fetch(`https://leetcode.com/api/submissions/?lastkey=&offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'cookie': `_csrf=${csrfToken}; LEETCODE_SESSION=${leetcodeSession};`,
        'x-csrftoken': csrfToken,
        'referer': 'https://leetcode.com',
      },}
    )
  return await response.json();
  }
    
    catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
}

module.exports = {
  findName,
  findSubmissons,
  findProgress,
  findAllSubmissions
};
