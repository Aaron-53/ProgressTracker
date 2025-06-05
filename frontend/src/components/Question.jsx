import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const userProgress = {
    completed:[
      {
        name: "Bob",
        solution:`function findLongestSubstring(s) {
  let maxLength = 0;
  let start = 0;
  let seen = new Map();

  for (let end = 0; end < s.length; end++) {
    let char = s[end];
    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }
    seen.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }

  return maxLength;
})`,
        timeTaken: "10 mins",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)"

      },
       {
        name: "john",
        solution:`printf("their code")`,
        timeTaken: "10 mins",
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)"

      }

    ],
    attempted: [
      {
        name: "Alice",
      currentSolution: `printf("Partial code");`,
      testCasesPassed: 3,
      },
      {
        name: "Alice1",
      currentSolution: `printf("Partial code");`,
      testCasesPassed: 7,
      }
    ],
     notAttempted: [
      { name: "Eve" }
    ]

  }

function Question() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [expandedCompleted, setExpandedCompleted] = useState(null)
  const [expandedAttempted, setExpandedAttempted] = useState(null)

  const toggleCompleted = (name) => {
    setExpandedCompleted(expandedCompleted === name ? null : name)
  }

  const toggleAttempted = (name) => {
    setExpandedAttempted(expandedAttempted === name ? null : name)
  }



  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/questions')}
          className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ← Back to Questions
        </button>
        
        <div className=" bg-white/10 backdrop-blur-md border border-white/20 shadow-xl  rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            Question {id}
          </h1>
          
          <div className="text-gray-400">
            <p>This is the content for question {id}.</p>
          </div>
           <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-green-400">
              Completed ✅ ({userProgress.completed.length})
            </h2>
            <ul className="space-y-2">
              {userProgress.completed.map(({ name, solution, timeTaken, timeComplexity, spaceComplexity }) => (
                <li key={name}>
                  <button
                    className="text-left w-full hover:underline border-white rounded-md px-3 py-2 bg-white/5 hover:bg-white/10 text-white pl-4"
                    onClick={() => toggleCompleted(name)}
                  >
                    {name}
                  </button>
                  {expandedCompleted === name && (
                    <div className="mt-2 p-4 bg-white/10 rounded text-sm whitespace-pre-wrap font-mono text-white">
                      <p><strong>Solution:</strong></p>
                      <pre className='pl-2'>{solution}</pre>
                      <p><strong>Time Taken:</strong> {timeTaken}</p>
                      <p><strong>Time Complexity:</strong> {timeComplexity}</p>
                      <p><strong>Space Complexity:</strong> {spaceComplexity}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-yellow-400">
              Attempted 🕗 ({userProgress.attempted.length})
            </h2>
            <ul className="space-y-2">
              {userProgress.attempted.map(({ name, currentSolution, testCasesPassed }) => (
                <li key={name}>
                  <button
                    className="text-left w-full hover:underline border-white rounded-md px-3 py-2 bg-white/5 hover:bg-white/10 text-white pl-4"
                    onClick={() => toggleAttempted(name)}
                  >
                    {name}
                  </button>
                  {expandedAttempted === name && (
                    <div className="mt-2 p-4 bg-white/10 rounded text-sm whitespace-pre-wrap font-mono text-white">
                      <p><strong>Current Solution:</strong></p>
                      <pre className='pl-2'>{currentSolution}</pre>
                      <p><strong>Test Cases Passed:</strong> {testCasesPassed}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-red-400">
              Not Attempted ❌ ({userProgress.notAttempted.length})
            </h2>
            <ul className="text-left w-full border-white rounded-md px-3 py-2 bg-white/5 hover:bg-white/10 text-white pl-4">
              {userProgress.notAttempted.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>

          

        </div>
      </div>
    </div>
  )
}

export default Question