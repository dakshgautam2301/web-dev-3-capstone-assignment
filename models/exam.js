
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        subject: {
            type: String,
            required: true
        },

        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        assignedSections: [{
            type: String
        }],

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        totalMarks: {
            type: Number,
            required: true,
            min: 1
        },

        passingMarks: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["draft", "scheduled", "active", "completed"],
            default: "draft"
        },

        resultsPublished: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


examSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model("Exam", examSchema);
