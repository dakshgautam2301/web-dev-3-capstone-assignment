
const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },

                selectedAnswer: {
                    type: String,
                    default: ""
                },

                isCorrect: {
                    type: Boolean,
                    default: false
                },

                marksAwarded: {
                    type: Number,
                    default: 0
                }
            }
        ],

        startedAt: {
            type: Date,
            default: Date.now
        },

        submittedAt: {
            type: Date
        },

        status: {
            type: String,
            enum: ["in-progress", "submitted", "evaluated"],
            default: "in-progress"
        }
    },
    { timestamps: true }
);

attemptSchema.index(
    { exam: 1, student: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
