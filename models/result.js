
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
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

        attempt: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attempt",
            required: true
        },

        totalMarks: {
            type: Number,
            required: true
        },

        obtainedMarks: {
            type: Number,
            required: true,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },

        resultStatus: {
            type: String,
            enum: ["pass", "fail"],
            required: true
        },

        published: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

resultSchema.index(
    { exam: 1, student: 1 },
    { unique: true }
);

module.exports = mongoose.model("Result", resultSchema);
