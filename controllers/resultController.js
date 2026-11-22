const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");

const eventEmitter = require("../utils/eventEmitter");
const { getIO } = require("../services/socketService");

const evaluateAttempt = async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id)
            .populate("exam");

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }

        if (attempt.status !== "submitted") {
            return res.status(400).json({
                success: false,
                message: "Only submitted examinations can be evaluated"
            });
        }

        const exam = await Exam.findById(attempt.exam._id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Examination not found"
            });
        }

        const questions = await Question.find({
            _id: { $in: exam.questions }
        }).select("+correctAnswer");

        let obtainedMarks = 0;

        for (const answer of attempt.answers) {
            const question = questions.find(
                q => q._id.toString() === answer.question.toString()
            );

            if (!question) continue;

            if (answer.selectedAnswer === question.correctAnswer) {
                answer.isCorrect = true;
                answer.marksAwarded = question.marks;
                obtainedMarks += question.marks;
            } else {
                answer.isCorrect = false;
                answer.marksAwarded = -question.negativeMarks;
                obtainedMarks -= question.negativeMarks;
            }
        }

        if (obtainedMarks < 0) {
            obtainedMarks = 0;
        }

        const percentage = exam.totalMarks > 0
            ? (obtainedMarks / exam.totalMarks) * 100
            : 0;

        const resultStatus =
            obtainedMarks >= exam.passingMarks ? "pass" : "fail";

        attempt.status = "evaluated";
        await attempt.save();

        const result = await Result.findOneAndUpdate(
            {
                exam: exam._id,
                student: attempt.student
            },
            {
                exam: exam._id,
                student: attempt.student,
                attempt: attempt._id,
                totalMarks: exam.totalMarks,
                obtainedMarks,
                percentage,
                resultStatus,
                published: exam.resultsPublished
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        eventEmitter.emit("resultGenerated", result);

        getIO().to(`student-${attempt.student}`).emit("result-generated", {
            message: "Your examination result has been generated",
            examId: exam._id,
            attemptId: attempt._id,
            resultId: result._id,
            obtainedMarks,
            totalMarks: exam.totalMarks,
            percentage,
            resultStatus
        });

        res.status(200).json({
            success: true,
            message: "Examination evaluated successfully",
            result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({
            student: req.user._id,
            published: true
        }).populate("exam", "title subject totalMarks");

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate("student", "name email rollNumber")
            .populate("exam", "title subject totalMarks");

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    evaluateAttempt,
    getMyResults,
    getAllResults
};
