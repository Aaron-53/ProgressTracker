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
  Folder,
  Send,
  X,
  Link,
  FileText,
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [newSetName, setNewSetName] = useState("");
  const [bulkAddInput, setBulkAddInput] = useState("");
  const [selectedProblemSet, setSelectedProblemSet] = useState("");

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

  const extractAllTitleSlugs = (text) => {
    try {
      const titleSlugs = new Set(); // Use Set to avoid duplicates

      // Clean the text - remove extra spaces and normalize
      const cleanedText = text.trim().replace(/\s+/g, ' ');

      // Pattern 1: Extract from full LeetCode URLs
      const urlRegex = /leetcode\.com\/problems\/([a-zA-Z0-9\-]+)/g;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(cleanedText)) !== null) {
        if (urlMatch[1] && urlMatch[1].length > 0) {
          titleSlugs.add(urlMatch[1]);
        }
      }

      // Pattern 2: Extract standalone title slugs (word-word-word format)
      // Look for sequences of words separated by hyphens
      const slugRegex = /\b([a-zA-Z]+(?:-[a-zA-Z0-9]+)+)\b/g;
      let slugMatch;
      while ((slugMatch = slugRegex.exec(cleanedText)) !== null) {
        const potentialSlug = slugMatch[1];
        // Filter out common false positives and ensure it looks like a LeetCode slug
        if (potentialSlug.length >= 5 && potentialSlug.length <= 50 &&
            !potentialSlug.includes('--') && // avoid double hyphens
            potentialSlug.split('-').length >= 2) { // at least 2 words
          titleSlugs.add(potentialSlug);
        }
      }

      return Array.from(titleSlugs);
    } catch (error) {
      console.error('Error extracting title slugs:', error);
      return [];
    }
  };

  const uploadQuestion = async (titleSlug) => {
    const response = await fetch(API_ENDPOINTS.QUESTIONS_UPLOAD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titleSlug })
    });
    return await response.json();
  };

  const bulkAddProblemsToSet = async (targetSetName) => {
    if (!targetSetName) {
      alert("Please specify a problem set");
      return;
    }

    if (!bulkAddInput.trim()) {
      alert("Please enter problem details");
      return;
    }

    const titleSlugs = extractAllTitleSlugs(bulkAddInput);
    if (titleSlugs.length === 0) {
      alert("No valid LeetCode URLs or title slugs found");
      return;
    }

    setUploadLoading(true);
    setUploadMessage({ type: '', text: '' });

    try {
      let successCount = 0;
      let failCount = 0;

      // If creating a new set, create it first
      if (newSetName.trim() && !selectedProblemSet) {
        const token = localStorage.getItem("token");
        const tempSlug = `temp-${Date.now()}`;

        // Create the set with a temporary problem
        const createResponse = await fetch(API_ENDPOINTS.CLASS_ADD_PROBLEM, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            className: classData.className,
            batchYear: classData.batchYear,
            problemSetName: newSetName.trim(),
            problem: {
              titleSlug: tempSlug,
              title: "Temporary Problem (will be removed)",
              difficulty: "Easy",
            },
          }),
        });

        if (createResponse.ok) {
          // Remove the temporary problem
          await fetch(API_ENDPOINTS.CLASS_REMOVE_PROBLEM, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              className: classData.className,
              batchYear: classData.batchYear,
              problemSetName: newSetName.trim(),
              titleSlug: tempSlug,
            }),
          });
        }
      }

      // Upload questions to database and add to set
      for (const titleSlug of titleSlugs) {
        try {
          const uploadResponse = await uploadQuestion(titleSlug);
          if (uploadResponse.success) {
            // Then add to problem set
            const token = localStorage.getItem("token");
            const setResponse = await fetch(API_ENDPOINTS.CLASS_ADD_PROBLEM, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                className: classData.className,
                batchYear: classData.batchYear,
                problemSetName: targetSetName,
                problem: {
                  titleSlug: titleSlug,
                  title: uploadResponse.data.title,
                  difficulty: uploadResponse.data.difficulty || "Medium",
                },
              }),
            });

            if (setResponse.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error("Error processing problem:", error);
        }
      }

      if (successCount > 0) {
        setUploadMessage({
          type: 'success',
          text: `Successfully added ${successCount} problem${successCount > 1 ? 's' : ''} to "${targetSetName}"${failCount > 0 ? `. ${failCount} failed.` : ''}!`
        });
        setBulkAddInput("");

        // If we created a new set, update the selection to show it in the dropdown
        if (newSetName.trim() && !selectedProblemSet) {
          setSelectedProblemSet(newSetName.trim());
          setNewSetName("");
        }

        fetchClassData();
      } else {
        setUploadMessage({
          type: 'error',
          text: `Failed to add any problems to "${targetSetName}". Please try again.`
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteProblemSet = async (problemSetName) => {
    if (!confirm(`Are you sure you want to delete the "${problemSetName}" problem set? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.CLASS_REMOVE_SET, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: classData.className,
          batchYear: classData.batchYear,
          problemSetName,
        }),
      });

      if (response.ok) {
        alert("Problem set deleted successfully!");
        fetchClassData();
      } else {
        const data = await response.json();
        alert("Failed to delete problem set: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting problem set:", error);
      alert("Error deleting problem set");
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
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 text-green-500 hover:text-green-600 border border-green-500/60 rounded-lg text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={refreshing ? "animate-spin" : ""}
                    size={16}
                  />
                  {refreshing ? "Updating..." : "Update Progress"}
                </button>
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="flex items-center gap-2 px-3 py-1 bg-white/10 text-purple-400 hover:text-purple-500 border border-purple-400/60 rounded-lg text-xs sm:text-sm cursor-pointer"
                >
                  <Settings size={16} />
                  {showAdminPanel ? "Hide" : "Show"} Panel
                </button>
              </div>
            </div>

            {showAdminPanel && (
              <div className="bg-black/20 rounded-lg p-4 space-y-4">
                {/* Unified Problem Set Manager */}
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Folder size={18} />
                    Problem Set Manager
                  </h4>

                  {/* Message Display */}
                  {uploadMessage.text && (
                    <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between ${
                      uploadMessage.type === 'success'
                        ? 'bg-green-500/20 border-green-500/50 text-green-300'
                        : uploadMessage.type === 'warning'
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                        : 'bg-red-500/20 border-red-500/50 text-red-300'
                    }`}>
                      <p className="text-sm">{uploadMessage.text}</p>
                      <button className="cursor-pointer" onClick={() => setUploadMessage({ type: '', text: '' })}>
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Problem Set Selection */}
                  <div className="mb-4">
                    <div className="flex-cols-1 md:flex-cols-3 gap-4 items-center flex justify-between">
                    {/* Create New Set */}
                      <div className="w-[46%] flex-1">
                        <label className="block text-white/80 text-xs sm:text-sm font-medium mb-2">
                          Create Problem Set
                        </label>
                        <input
                          type="text"
                          placeholder="Enter new Problem Set name..."
                          value={newSetName}
                          onChange={(e) => {
                            setNewSetName(e.target.value);
                            setSelectedProblemSet(""); // Clear selection when typing new set
                          }}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                        />
                      </div>

                      <div className="text-white/80 text-sm font-medium mt-6">- OR -</div>

                      {/* Select Existing Set */}
                      <div className="w-[46%] flex-1">
                        <label className="block text-white/80 text-xs sm:text-sm font-medium mb-2">
                          Select Problem Set
                        </label>
                        <select
                          value={selectedProblemSet}
                          onChange={(e) => {
                            setSelectedProblemSet(e.target.value);
                            setNewSetName(""); // Clear new set input when selecting existing
                          }}
                          className="w-full px-3 py-[11px] text-xs sm:text-sm bg-white/10 border border-white/20 rounded text-white"
                        >
                          <option value="">Choose a Problem Set...</option>
                          {classData?.problemSets?.map((set) => (
                            <option key={set.name} value={set.name}>
                              {set.name} ({set.problems.length} problems)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>                   
                  </div>

                  

                  {/* Add Problems */}
                  {(selectedProblemSet || newSetName.trim()) && (
                    <div className="mb-4">
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Add Problems to {selectedProblemSet || newSetName.trim()}
                      </label>
                      <div className="space-y-3">
                        <textarea
                          value={bulkAddInput}
                          onChange={(e) => setBulkAddInput(e.target.value)}
                          placeholder={`Paste LeetCode URLs or title slugs to add to "${selectedProblemSet || newSetName.trim()}"...
Example:
• two-sum 
• https://leetcode.com/problems/merge-two-sorted-lists/
• binary-tree-inorder-traversal
                          `}
                          rows={3}
                          className="w-full h-30 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 resize-y leading-relaxed"
                          style={{ fontFamily: 'monospace' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const targetSet = selectedProblemSet || newSetName.trim();
                              bulkAddProblemsToSet(targetSet);
                            }}
                            disabled={uploadLoading || !bulkAddInput.trim()}
                            className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadLoading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border border-white/30 border-t-white"></div>
                            ) : (
                              <Plus size={14} />
                            )}
                            Add Problems
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProblemSet("");
                              setNewSetName("");
                              setBulkAddInput("");
                            }}
                            className="bg-gray-600/80 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-200"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {problemSet.name}
                  </h2>

                  {user?.isAdmin && problemSet.problems.length === 0 && (
                    <button
                      onClick={() => deleteProblemSet(problemSet.name)}
                      className=" bg-white/10 text-red-500 hover:text-red-600 py-1 px-3 rounded-xl transition-all duration-200 text-sm flex items-center gap-1 cursor-pointer"
                      title="Delete this empty set"
                    >
                      <Trash2 size={14} />
                      Delete Problem Set
                    </button>
                  )}
                </div>

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
                                className="p-2 bg-white/10 text-red-500 hover:text-red-600 rounded-lg cursor-pointer"
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
