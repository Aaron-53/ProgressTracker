import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function Question() {
  const { titleSlug } = useParams()
  const navigate = useNavigate()

  const [expandedCompleted, setExpandedCompleted] = useState(null)
  const [expandedAttempted, setExpandedAttempted] = useState(null)
  const [questionContent, setQuestionContent] = useState(null)
  const [userProgress, setUserProgress] = useState({
    completed: [],
    attempted: [],
    notAttempted: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [questionRes, userRes, allUserRes] = await Promise.all([
          axios.get(API_ENDPOINTS.QUESTIONS),
          axios.get(`${API_ENDPOINTS.USER_PROGRESS}/${titleSlug}`),
          axios.get(API_ENDPOINTS.USER_PROGRESS)
        ])

        const question = questionRes.data.data.find(q => q.titleSlug === titleSlug)
        setQuestionContent(question)

        const completedUsers = userRes.data.completed.map(user => ({
          name: user.user,
          language: user.language,
          solution: `Solution not available`,
          timeTaken: "-",
          timeComplexity: "-",
          spaceComplexity: "-"
        }))

        const attemptedUsers = userRes.data.attempted.map(user => ({
          name: user.user,
          currentSolution: `Partial code not available`,
          testCasesPassed: "-"
        }))
        const completedNames = userRes.data.completed.map(u => u.user)
        const attemptedNames = userRes.data.attempted.map(u => u.user)
        const allAttemptedOrCompleted = new Set([...completedNames, ...attemptedNames])
        const notAttemptedUsers = allUserRes.data.users
        .filter(user => !allAttemptedOrCompleted.has(user.username))
        .map(user => ({ name: user.username }))

        setUserProgress({
          completed: completedUsers,
          attempted: attemptedUsers,
          notAttempted: notAttemptedUsers
        })

      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [titleSlug])

  const toggleCompleted = (name) => {
    setExpandedCompleted(expandedCompleted === name ? null : name)
  }

  const toggleAttempted = (name) => {
    setExpandedAttempted(expandedAttempted === name ? null : name)
  }
  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <div className=" max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/questions')}
          className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ← Back to Questions
        </button>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-4">
            {questionContent?.title || `Question ${titleSlug}`}
          </h1>

          <div className="text-gray-400 mb-6 question-content">
            {loading ? (
              <p>Loading...</p>
            ) : questionContent ? (
              <div dangerouslySetInnerHTML={{ __html: questionContent.content }} />
            ) : (
              <p>Question not found.</p>
            )}
          </div>

          {/* Completed */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-green-400">
              Completed ✅ ({userProgress.completed.length})
            </h2>
            <ul className="space-y-2">
              {userProgress.completed.map(({ name, solution, timeTaken, timeComplexity, spaceComplexity }) => (
                <li key={name}>
                  <button
                    className="text-left inline-block cursor-pointer border-white rounded-md px-3 py-2 bg-white/5 hover:bg-white/10 text-white"
                    onClick={() => toggleCompleted(name)}
                  >
                    {name}
                  </button>
                  {expandedCompleted === name && (
                    <div className="mt-2 p-4 bg-white/10 rounded text-sm whitespace-pre-wrap font-mono text-white">
                       <p><strong>Language Used:</strong> {userProgress.completed.find(u => u.name === name)?.language || 'Unknown'}</p>
                      {/*
                      <p><strong>Solution:</strong></p>
                      <pre className='pl-2'>{solution}</pre>
                      <p><strong>Time Taken:</strong> {timeTaken}</p>
                      <p><strong>Time Complexity:</strong> {timeComplexity}</p>
                      <p><strong>Space Complexity:</strong> {spaceComplexity}</p>*/}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Attempted */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-yellow-400">
              Attempted 🕗 ({userProgress.attempted.length})
            </h2>
            <ul className="space-y-2">
              {userProgress.attempted.map(({ name, currentSolution, testCasesPassed }) => (
                <li key={name}>
                  <button
                    className="text-left inline-block  border-white rounded-md px-3 py-2 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
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

          {/* Not Attempted */}
          <div>
  <h2 className="text-xl font-semibold mb-3 text-red-400">
    Not Attempted ❌ ({userProgress.notAttempted.length})
  </h2>

  {userProgress.notAttempted.length > 0 ? (
    <ul className="text-left inline-block px-3 py-2 text-white">
      {userProgress.notAttempted.map(({ name }) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-400 italic">Everyone attempted. Yayy!!</p>
  )}
</div>

        </div>
      </div>
    </div>
  )
}

export default Question