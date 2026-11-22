
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length >= 2;
                },
                message: "At least two options are required"
            }
        },

        correctAnswer: {
            type: String,
            required: true,
            select: false
        },

        subject: {
            type: String,
            required: true
        },

        topic: {
            type: String,
            required: true
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium"
        },

        marks: {
            type: Number,
            required: true,
            min: 1
        },

        negativeMarks: {
            type: Number,
            default: 0,
            min: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);


questionSchema.index({ subject: 1, difficulty: 1 });

module.exports = mongoose.model("Question", questionSchema);
