import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  CheckCircle,
  Clock,
  Play,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import Navbar from "./Navbar";

const Class = () => {
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newProblem, setNewProblem] = useState({
    titleSlug: "",
    title: "",
    difficulty: "Easy",
    problemSetName: "",
  });

  useEffect(() => {
    fetchClassData();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(API_ENDPOINTS.AUTH_VALIDATE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log(response.data);
        const data = await response.json();
        console.log(data);
        setUser(data.user);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login");
    }
  };

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CLASS_ASSIGNMENTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClassData(data.data);

        // Fetch user progress for comparison
        const progressResponse = await fetch(API_ENDPOINTS.USER_PROGRESS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const currentUser = progressData.users.find(
            (u) => u.username === data.data?.username
          );
          if (currentUser) {
            const solvedMap = {};
            currentUser.solvedQuestions.forEach((q) => {
              solvedMap[q.titleSlug] = q.status === "Accepted";
            });
            setUserProgress(solvedMap);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.USER_PROGRESS_TRIGGER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        alert("Progress updated successfully!");
        fetchClassData(); // Refresh the data
      } else {
        alert("Failed to update progress: " + data.message);
      }
    } catch (error) {
      console.error("Error triggering manual refresh:", error);
      alert("Error triggering manual refresh");
    } finally {
      setRefreshing(false);
    }
  };

  const handleProblemClick = (titleSlug) => {
    const title  = titleSlug.replace(" ", "-").toLowerCase();
    window.open(`https://leetcode.com/problems/${title}/`, "_blank");
  };

  const addProblemToSet = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CLASS_ADD_PROBLEM, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: classData.className,
          batchYear: classData.batchYear,
          problemSetName: newProblem.problemSetName,
          problem: {
            titleSlug: newProblem.titleSlug,
            title: newProblem.title,
            difficulty: newProblem.difficulty,
          },
        }),
      });

      if (response.ok) {
        alert("Problem added successfully!");
        setNewProblem({
          titleSlug: "",
          title: "",
          difficulty: "Easy",
          problemSetName: "",
        });
        fetchClassData();
      } else {
        const data = await response.json();
        alert("Failed to add problem: " + data.message);
      }
    } catch (error) {
      console.error("Error adding problem:", error);
      alert("Error adding problem");
    }
  };

  const removeProblemFromSet = async (problemSetName, titleSlug) => {
    if (!confirm("Are you sure you want to remove this problem?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CLASS_REMOVE_PROBLEM, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: classData.className,
          batchYear: classData.batchYear,
          problemSetName,
          titleSlug,
        }),
      });

      if (response.ok) {
        alert("Problem removed successfully!");
        fetchClassData();
      } else {
        const data = await response.json();
        alert("Failed to remove problem: " + data.message);
      }
    } catch (error) {
      console.error("Error removing problem:", error);
      alert("Error removing problem");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading class assignments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <Navbar />

      <div className="max-w-6xl mx-auto pt-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Class Assignments
          </h1>
          {classData && (
            <p className="text-white/70 text-lg">
              {classData.className} - Batch {classData.batchYear}
            </p>
          )}
        </div>

        {/* Admin Controls */}
        {user?.isAdmin && (
          <div className="mb-6 bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Admin Controls</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600/80 hover:bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <RefreshCw
                    className={refreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  {refreshing ? "Updating..." : "Update Progress"}
                </button>
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-sm"
                >
                  <Settings size={16} />
                  {showAdminPanel ? "Hide" : "Show"} Panel
                </button>
              </div>
            </div>

            {showAdminPanel && (
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">
                  Add Problem to Set
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Problem Set Name"
                    value={newProblem.problemSetName}
                    onChange={(e) =>
                      setNewProblem({
                        ...newProblem,
                        problemSetName: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Title Slug"
                    value={newProblem.titleSlug}
                    onChange={(e) =>
                      setNewProblem({
                        ...newProblem,
                        titleSlug: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Problem Title"
                    value={newProblem.title}
                    onChange={(e) =>
                      setNewProblem({ ...newProblem, title: e.target.value })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  />
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) =>
                      setNewProblem({
                        ...newProblem,
                        difficulty: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <button
                    onClick={addProblemToSet}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Problem Sets */}
        {classData?.problemSets?.length > 0 ? (
          <div className="space-y-6">
            {classData.problemSets.map((problemSet, setIndex) => (
              <div
                key={setIndex}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  {problemSet.name}
                </h2>

                {problemSet.problems.length > 0 ? (
                  <div className="grid gap-4">
                    {problemSet.problems.map((problem, problemIndex) => {
                      const isCompleted = userProgress[problem.titleSlug];
                      const difficultyColor = {
                        Easy: "text-green-400",
                        Medium: "text-yellow-400",
                        Hard: "text-red-400",
                      }[problem.difficulty];

                      return (
                        <div
                          key={problemIndex}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                            isCompleted
                              ? "bg-green-500/20 border-green-400/30"
                              : "bg-white/5 border-white/20 hover:bg-white/10"
                          }`}
                          onClick={() => handleProblemClick(problem.titleSlug)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8">
                              {isCompleted ? (
                                <CheckCircle
                                  className="text-green-400"
                                  size={24}
                                />
                              ) : (
                                <Clock className="text-white/50" size={24} />
                              )}
                            </div>

                            <div>
                              <h3 className="text-white font-semibold">
                                {problem.title}
                              </h3>
                              <p className={`text-sm ${difficultyColor}`}>
                                {problem.difficulty}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {user?.isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProblemFromSet(
                                    problemSet.name,
                                    problem.titleSlug
                                  );
                                }}
                                className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <ExternalLink className="text-white/50" size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">
                    No problems assigned in this set yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto text-white/50 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Assignments Yet
            </h3>
            <p className="text-white/60">
              Your class doesn't have any problem assignments yet. Check back
              later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Class;
