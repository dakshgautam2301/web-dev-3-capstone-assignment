const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getMe
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const {
    validateRegistration,
    validateLogin
} = require("../middleware/validationMiddleware");

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);

router.post("/refresh", refreshAccessToken);

router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

module.exports = router;
