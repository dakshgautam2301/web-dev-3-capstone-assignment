const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false
        },

        role: {
            type: String,
            enum: ["admin", "faculty", "student"],
            default: "student"
        },

        rollNumber: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        },

        department: {
            type: String,
            trim: true
        },

        section: {
            type: String,
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        refreshToken: {
            type: String,
            select: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
