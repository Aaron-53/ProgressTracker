import { useParams, useNavigate } from 'react-router-dom'

function Question() {
  const { id } = useParams()
  const navigate = useNavigate()

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
        </div>
      </div>
    </div>
  )
}

export default Question