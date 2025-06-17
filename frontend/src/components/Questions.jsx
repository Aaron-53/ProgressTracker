import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Questions() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/questions/')
        const data = await response.json()
        if (data.success) {
          setQuestions(data.data)
        }
      } catch (error) {
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuestions()
  }, [])

  const handleQuestionClick = (titleSlug) => {
    navigate(`/question/${titleSlug}`)
  }

  const truncateText = (text, maxLength = 80) => {
    // Remove HTML tags first
    const plainText = text.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-transparent border border-green-500 text-green-500'
      case 'medium': return 'bgtransparent border border-yellow-500 text-yellow-500'
      case 'hard': return 'bg-transparent border border-red-500 text-red-500'
      default: return 'bg-transparent border border-gray-500 text-gray-500'
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <section id="questions" className="h-screen w-screen flex items-center justify-center p-3 sm:p-6">    
        <div className="w-full max-w-3xl h-[80vh] mx-4 sm:mx-8 p-4 px-6 sm:p-6 sm:px-12 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl  rounded-lg  flex flex-col">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mt-2 mb-4 sm:mb-8 text-white ">
                Select a Question
            </h1>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent px-1 sm:px-2">
                <div className="flex flex-col gap-3 sm:gap-4">
                    {questions.map((question) => (
                    <button
                        key={question._id}
                        onClick={() => handleQuestionClick(question.titleSlug)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-6 sm:py-5 sm:px-8 rounded-xl transition duration-200 transform hover:scale-101 shadow-lg border border-white/20 text-left min-h-[5rem] sm:min-h-[6rem] flex flex-col justify-start relative"
                    >
                        {/* Difficulty Badge - Top Right Corner */}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                                {question.difficulty}
                            </span>
                        </div>

                        {/* Question Content */}
                        <div className="text-lg sm:text-xl font-bold mb-2 pr-16">
                            {question.title}
                        </div>
                        <div className="text-sm sm:text-base text-white/70 font-normal leading-relaxed">
                            {truncateText(question.content)}
                        </div>
                    </button>
                    ))}
                </div>
            </div>
        </div>
    </section>
  )
}

export default Questions