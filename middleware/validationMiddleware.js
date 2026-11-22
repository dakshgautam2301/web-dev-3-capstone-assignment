
const validateRegistration = (req, res, next) =>    {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    if (name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must contain at least 2 characters"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
        });
    }

    next();
};


const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    next();
};


const validateObjectId = (req, res, next) => {
    const id = req.params.id || req.params.examId;

    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format"
        });
    }

    next();
};


module.exports = {
    validateRegistration,
    validateLogin,
    validateObjectId
};
