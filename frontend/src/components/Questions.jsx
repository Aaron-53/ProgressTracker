import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

function Questions() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.QUESTIONS);
        const data = await response.json();
        if (data.success) {
          setQuestions(data.data);
          groupQuestionsByDate(data.data);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const groupQuestionsByDate = (questionsData) => {
    const grouped = questionsData.reduce((acc, question) => {
      // Extract UTC date without any timezone conversion
      const date = new Date(question.createdAt || question.updatedAt);
      const dateStr = date.toISOString().split("T")[0]; // Gets YYYY-MM-DD
      const [year, month, day] = dateStr.split("-");
      const formattedDate = `${day}/${month}/${year}`; // Convert to DD/MM/YYYY

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(question);
      return acc;
    }, {});

    // Sort dates in descending order (latest first)
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.split("/").map(Number);
        const [dayB, monthB, yearB] = b.split("/").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB - dateA;
      })
      .reduce((acc, date) => {
        acc[date] = grouped[date];
        return acc;
      }, {});

    setGroupedQuestions(sortedGrouped);
  };

  const handleQuestionClick = (titleSlug) => {
    navigate(`/question/${titleSlug}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-transparent border border-green-500 text-green-500";
      case "medium":
        return "bg-transparent border border-yellow-500 text-yellow-500";
      case "hard":
        return "bg-transparent border border-red-500 text-red-500";
      default:
        return "bg-transparent border border-gray-500 text-gray-500";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section
      id="questions"
      className="h-screen w-screen flex items-center justify-center p-3 sm:p-6"
    >
      <Navbar />

      <div className="w-full mt-12 max-w-3xl h-[80vh] mx-4 sm:mx-8 p-4 px-6 sm:p-6 sm:px-12 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl  rounded-lg  flex flex-col">
        {/* Header */}
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Select a Question
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent px-1 sm:px-2">
          {Object.keys(groupedQuestions).length === 0 ? (
            <div className="flex flex-col gap-3 sm:gap-4">
              {questions.map((question) => (
                <button
                  key={question._id}
                  onClick={() => handleQuestionClick(question.titleSlug)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-6 sm:py-5 sm:px-8 rounded-xl transition duration-200 transform hover:scale-101 shadow-lg border border-white/20 text-left min-h-[5rem] sm:min-h-[6rem] flex flex-col justify-start relative"
                >
                  {/* Difficulty Badge - Top Right Corner */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="text-md sm:text-xl font-bold mb-2 pr-16">
                    {question.title}
                  </div>
                  <div className="text-sm sm:text-base text-white/70 font-normal leading-tight overflow-hidden text-ellipsis whitespace-nowrap w-full pr-16">
                    {question.content.replace(/<[^>]*>/g, "")}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {Object.entries(groupedQuestions).map(
                ([date, questionsForDate]) => (
                  <div key={date} className="mb-6">
                    {/* Date Header */}
                    <div className="mb-3">
                      <h2 className="text-md sm:text-lg font-semibold text-white/90 border-b border-white/20 pb-2">
                        {date}
                      </h2>
                    </div>

                    {/* Questions for this date */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {questionsForDate.map((question) => (
                        <button
                          key={question._id}
                          onClick={() =>
                            handleQuestionClick(question.titleSlug)
                          }
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-4 sm:py-4 sm:px-6 rounded-xl transition duration-200 transform hover:scale-101 shadow-lg border border-white/20 text-left min-h-[5rem] sm:min-h-[6rem] flex flex-col justify-start relative"
                        >
                          {/* Difficulty Badge - Top Right Corner */}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                                question.difficulty
                              )}`}
                            >
                              {question.difficulty}
                            </span>
                          </div>

                          {/* Question Content */}
                          <div className="text-md sm:text-xl font-bold mb-2 pr-16">
                            {question.title}
                          </div>
                          <div className="text-sm sm:text-base text-white/70 font-normal leading-tight overflow-hidden text-ellipsis whitespace-nowrap w-full pr-16">
                            {question.content.replace(/<[^>]*>/g, "")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Questions;
