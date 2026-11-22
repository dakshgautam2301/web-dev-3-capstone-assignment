const User = require("../models/User");
const Exam = require("../models/Exam");
const Attempt = require("../models/Attempt");
const Result = require("../models/Result");

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalFaculty = await User.countDocuments({ role: "faculty" });
        const totalExams = await Exam.countDocuments();
        const totalAttempts = await Attempt.countDocuments();
        const completedAttempts = await Attempt.countDocuments({
            status: { $in: ["submitted", "evaluated"] }
        });

        const resultStats = await Result.aggregate([
            {
                $group: {
                    _id: "$resultStatus",
                    count: { $sum: 1 },
                    averagePercentage: { $avg: "$percentage" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalStudents,
                totalFaculty,
                totalExams,
                totalAttempts,
                completedAttempts
            },
            resultStats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getSubjectPerformance = async (req, res) => {
    try {
        const subjectPerformance = await Result.aggregate([
            {
                $lookup: {
                    from: "exams",
                    localField: "exam",
                    foreignField: "_id",
                    as: "examDetails"
                }
            },
            {
                $unwind: "$examDetails"
            },
            {
                $group: {
                    _id: "$examDetails.subject",
                    totalResults: { $sum: 1 },
                    averageMarks: { $avg: "$obtainedMarks" },
                    averagePercentage: { $avg: "$percentage" },
                    passCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$resultStatus", "pass"] },
                                1,
                                0
                            ]
                        }
                    },
                    failCount: {
                        $sum: {
                            $cond: [
                                { $eq: ["$resultStatus", "fail"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { averagePercentage: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            subjectPerformance
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getDashboardStats,
    getSubjectPerformance
};
