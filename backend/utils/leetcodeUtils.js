const fetch = require('node-fetch');

async function fetchQuestionFromLeetCode(titleSlug) {
  const query = `
    query questionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        content
        difficulty
        likes
        dislikes
        topicTags {
          name
          slug
        }
      }
    }
  `;

  const response = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { titleSlug },
    }),
  });

  const result = await response.json();
  if (result.data && result.data.question) {
    return result.data.question;
  } else {
    throw new Error('Question not found or LeetCode API error');
  }
}


// Fetch LeetCode username using session and csrf token
async function fetchLeetCodeUsername(session, csrf) {
  const response = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'cookie': `_csrf=${csrf}; LEETCODE_SESSION=${session};`,
      'x-csrftoken': csrf,
      'referer': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query: `query { user { username } }`
    })
  });
  const result = await response.json();
  if (result.data && result.data.user && result.data.user.username) {
    return result.data.user.username;
  } else {
    throw new Error('Could not fetch LeetCode username');
  }
}

module.exports = { fetchQuestionFromLeetCode, fetchLeetCodeUsername };

