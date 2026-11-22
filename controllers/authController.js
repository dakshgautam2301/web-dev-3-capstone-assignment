
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateTokens = require("../utils/generateToken");

// REGISTER
const registerUser = async (req, res) => {
    try {
        const { name, email, password, rollNumber, department, section } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student",
            rollNumber,
            department,
            section
        });

        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials or inactive account"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const tokens = generateTokens(user._id, user.role);

        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// REFRESH ACCESS TOKEN
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id).select("+refreshToken");

        if (!user || !user.isActive || user.refreshToken !== refreshToken) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        const tokens = generateTokens(user._id, user.role);

        // Rotate the refresh token.
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            ...tokens
        });

    } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
};

// LOGOUT
const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("+refreshToken");

        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET LOGGED-IN USER
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getMe
};
