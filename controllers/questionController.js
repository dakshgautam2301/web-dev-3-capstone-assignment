
const Question = require("../models/Question");

// 1. Create a new question
const createQuestion = async (req, res) => {
    try {
        const {
            questionText,
            options,
            correctAnswer,
            subject,
            topic,
            difficulty,
            marks,
            negativeMarks
        } = req.body;

        if (
            !questionText ||
            !options ||
            !correctAnswer ||
            !subject ||
            !difficulty ||
            !marks
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required question details"
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least two options are required"
            });
        }

        const question = await Question.create({
            questionText,
            options,
            correctAnswer,
            subject,
            topic,
            difficulty,
            marks,
            negativeMarks: negativeMarks || 0,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            question
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 2. Get all questions
const getAllQuestions = async (req, res) => {
    try {
        const { subject, difficulty, topic } = req.query;

        const filter = {};

        if (subject) filter.subject = subject;
        if (difficulty) filter.difficulty = difficulty;
        if (topic) filter.topic = topic;

        const questions = await Question.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 3. Get a question by ID
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            question
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 4. Update a question
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// 5. Delete a question
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};
