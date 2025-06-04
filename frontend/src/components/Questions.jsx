import { useNavigate } from 'react-router-dom'

function Questions() {
  const navigate = useNavigate()
  const questions = [1, 2, 3, 4,5,6,7,8,9,10]

  const handleQuestionClick = (questionId) => {
    navigate(`/question/${questionId}`)
  }

  return (
    <section id="questions" className="h-screen w-screen flex items-center justify-center p-3 sm:p-6">    
        <div className="w-full max-w-3xl h-[80vh] mx-4 sm:mx-8 p-4 px-6 sm:p-6 sm:px-12 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl  rounded-lg  flex flex-col">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mt-2 mb-4 sm:mb-8 text-white ">
                Select a Question
            </h1>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent px-1 sm:px-2">
                <div className="flex flex-col gap-3 sm:gap-4">
                    {questions.map((questionId) => (
                    <button
                        key={questionId}
                        onClick={() => handleQuestionClick(questionId)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-6 px-6 sm:py-8 sm:px-8 rounded-xl transition duration-200 transform hover:scale-101 shadow-lg border border-white/20 text-lg sm:text-xl min-h-[5rem] sm:min-h-[6rem]"
                    >
                        Question {questionId}
                    </button>
                    ))}
                </div>
            </div>
        </div>
    </section>
  )
}

export default Questions