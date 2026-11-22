
const Attempt = require("../models/Attempt");
const Exam = require("../models/Exam");

const eventEmitter = require("../utils/eventEmitter");
const { getIO } = require("../services/socketService");

// Start an examination
const startAttempt = async (req, res) =>    {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId)
            .populate(
                "questions",
                "questionText options subject topic difficulty marks"
            );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Examination not found"
            });
        }

        const now = new Date();

        if (
            now < new Date(exam.startTime) ||
            now > new Date(exam.endTime) ||
            !["scheduled", "active"].includes(exam.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "This examination is not currently available"
            });
        }

        if (
            exam.assignedStudents.length > 0 &&
            !exam.assignedStudents.some(
                id => id.toString() === req.user._id.toString()
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this examination"
            });
        }

        if (
            exam.assignedSections.length > 0 &&
            !exam.assignedSections.includes(req.user.section)
        ) {
            return res.status(403).json({
                success: false,
                message: "Your section is not assigned to this examination"
            });
        }

        const existingAttempt = await Attempt.findOne({
            exam: examId,
            student: req.user._id
        });

        if (existingAttempt) {
            return res.status(400).json({
                success: false,
                message: "You have already started this examination",
                attempt: existingAttempt
            });
        }

        const attempt = await Attempt.create({
            exam: examId,
            student: req.user._id,
            startedAt: now,
            status: "in-progress"
        });

        res.status(201).json({
            success: true,
            message: "Examination started successfully",
            attempt,
            exam: {
                title: exam.title,
                duration: exam.duration,
                questions: exam.questions
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get student's examination attempts
const getMyAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({
            student: req.user._id
        }).populate("exam", "title subject duration totalMarks");

        res.status(200).json({
            success: true,
            count: attempts.length,
            attempts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get a particular attempt
const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findOne({
            _id: req.params.id,
            student: req.user._id
        }).populate("exam", "title subject duration totalMarks");

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Examination attempt not found"
            });
        }

        res.status(200).json({
            success: true,
            attempt
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Submit examination answers
const submitAttempt = async (req, res) => {
    try {
        const { answers } = req.body;

        const attempt = await Attempt.findOne({
            _id: req.params.id,
            student: req.user._id
        });

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Examination attempt not found"
            });
        }

        if (attempt.status !== "in-progress") {
            return res.status(400).json({
                success: false,
                message: "This examination has already been submitted"
            });
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be provided as an array"
            });
        }

        const exam = await Exam.findById(attempt.exam);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Examination not found"
            });
        }

        const examQuestionIds = exam.questions.map(
            id => id.toString()
        );

        const validAnswers = [];

        for (const answer of answers) {
            if (
                !answer.question ||
                !examQuestionIds.includes(answer.question.toString())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "An answer contains an invalid question"
                });
            }

            validAnswers.push({
                question: answer.question,
                selectedAnswer: answer.selectedAnswer || ""
            });
        }

        attempt.answers = validAnswers;
        attempt.submittedAt = new Date();
        attempt.status = "submitted";

        await attempt.save();

        // Trigger EventEmitter event
        eventEmitter.emit("examSubmitted", attempt);

        // Send real-time notification to the exam room
        getIO().to(`exam-${exam._id}`).emit("exam-submitted", {
            message: "A student has submitted the examination",
            examId: exam._id,
            attemptId: attempt._id,
            studentId: attempt.student,
            submittedAt: attempt.submittedAt
        });

        res.status(200).json({
            success: true,
            message: "Examination submitted successfully",
            attempt
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    startAttempt,
    getMyAttempts,
    getAttemptById,
    submitAttempt
};
