
const Exam = require("../models/Exam");
const eventEmitter = require("../utils/eventEmitter");
const { getIO } = require("../services/socketService");

// Create a new examination
const createExam = async (req, res) =>    {
    try {
        const {
            title,
            description,
            subject,
            questions,
            assignedStudents,
            assignedSections,
            startTime,
            endTime,
            duration,
            totalMarks,
            passingMarks
        } = req.body;

        if (
            !title ||
            !subject ||
            !startTime ||
            !endTime ||
            !duration ||
            totalMarks === undefined ||
            passingMarks === undefined ||
            !questions ||
            questions.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required examination details"
            });
        }

        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        const exam = await Exam.create({
            title,
            description,
            subject,
            questions,
            assignedStudents,
            assignedSections,
            startTime,
            endTime,
            duration,
            totalMarks,
            passingMarks,
            createdBy: req.user._id
        });

        // Trigger EventEmitter event
        eventEmitter.emit("examCreated", exam);

        // Send real-time notification through Socket.IO
        getIO().emit("exam-created", {
            message: "A new examination has been created",
            examId: exam._id,
            title: exam.title,
            subject: exam.subject
        });

        res.status(201).json({
            success: true,
            message: "Examination created successfully",
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get all examinations
const getAllExams = async (req, res) => {
    try {
        const filter = {};

        if (req.query.subject) {
            filter.subject = req.query.subject;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const exams = await Exam.find(filter)
            .populate("createdBy", "name email")
            .populate("questions", "questionText subject difficulty marks")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get examination by ID
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate("createdBy", "name email")
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

        res.status(200).json({
            success: true,
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Update examination
const updateExam = async (req, res) => {
    try {
        const allowedFields = [
            "title",
            "description",
            "subject",
            "questions",
            "assignedStudents",
            "assignedSections",
            "startTime",
            "endTime",
            "duration",
            "totalMarks",
            "passingMarks",
            "status",
            "resultsPublished"
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (
            updateData.startTime &&
            updateData.endTime &&
            new Date(updateData.endTime) <= new Date(updateData.startTime)
        ) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Examination not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Examination updated successfully",
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete examination
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Examination not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Examination deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam
};
