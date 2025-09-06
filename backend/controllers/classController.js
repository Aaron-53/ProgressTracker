const Class = require("../models/classModel");
const User = require("../models/userModel");

class classController {
  // Get class assignments for a user
  static async getClassAssignments(req, res) {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const classData = await Class.findOne({
        className: user.class,
        batchYear: user.batchYear,
      });

      if (!classData) {
        return res.status(200).json({
          success: true,
          message: "No assignments found for your class",
          data: {
            className: user.class,
            batchYear: user.batchYear,
            problemSets: [],
          },
        });
      }

      res.status(200).json({
        success: true,
        data: classData,
      });
    } catch (error) {
      console.error("Get class assignments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching class assignments",
      });
    }
  }

  // Admin: Create or update class with problem sets
  static async updateClassAssignments(req, res) {
    try {
      const { className, batchYear, problemSets } = req.body;

      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      // Validate required fields
      if (!className || !batchYear || !problemSets) {
        return res.status(400).json({
          success: false,
          message: "Class name, batch year, and problem sets are required",
        });
      }

      let classData = await Class.findOne({ className, batchYear });

      if (classData) {
        // Update existing class
        classData.problemSets = problemSets;
        await classData.save();
      } else {
        // Create new class
        classData = new Class({
          className,
          batchYear,
          problemSets,
        });
        await classData.save();
      }

      res.status(200).json({
        success: true,
        message: "Class assignments updated successfully",
        data: classData,
      });
    } catch (error) {
      console.error("Update class assignments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating class assignments",
      });
    }
  }

  // Admin: Add problem to a specific problem set
  static async addProblemToSet(req, res) {
    try {
      const { className, batchYear, problemSetName, problem } = req.body;

      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      let classData = await Class.findOne({ className, batchYear });

      if (!classData) {
        // Create new class if it doesn't exist
        classData = new Class({
          className,
          batchYear,
          problemSets: [
            {
              name: problemSetName,
              problems: [problem],
            },
          ],
        });
      } else {
        // Find or create problem set
        let problemSet = classData.problemSets.find(
          (ps) => ps.name === problemSetName
        );

        if (problemSet) {
          // Check if problem already exists
          const problemExists = problemSet.problems.some(
            (p) => p.titleSlug === problem.titleSlug
          );
          if (!problemExists) {
            problemSet.problems.push(problem);
          }
        } else {
          // Create new problem set
          classData.problemSets.push({
            name: problemSetName,
            problems: [problem],
          });
        }
      }

      await classData.save();

      res.status(200).json({
        success: true,
        message: "Problem added successfully",
        data: classData,
      });
    } catch (error) {
      console.error("Add problem error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while adding problem",
      });
    }
  }

  // Admin: Remove problem from a specific problem set
  static async removeProblemFromSet(req, res) {
    try {
      const { className, batchYear, problemSetName, titleSlug } = req.body;

      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const classData = await Class.findOne({ className, batchYear });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      const problemSet = classData.problemSets.find(
        (ps) => ps.name === problemSetName
      );

      if (!problemSet) {
        return res.status(404).json({
          success: false,
          message: "Problem set not found",
        });
      }

      problemSet.problems = problemSet.problems.filter(
        (p) => p.titleSlug !== titleSlug
      );
      await classData.save();

      res.status(200).json({
        success: true,
        message: "Problem removed successfully",
        data: classData,
      });
    } catch (error) {
      console.error("Remove problem error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while removing problem",
      });
    }
  }

  // Get all classes (Admin only)
  static async getAllClasses(req, res) {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const classes = await Class.find();

      res.status(200).json({
        success: true,
        data: classes,
      });
    } catch (error) {
      console.error("Get all classes error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching classes",
      });
    }
  }
}

module.exports = classController;
