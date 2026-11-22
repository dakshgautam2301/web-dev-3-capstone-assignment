const express = require("express");
const router = express.Router();

const {
    startAttempt,
    getMyAttempts,
    getAttemptById,
    submitAttempt
} = require("../controllers/attemptController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect);

router.use(authorizeRoles("student"));

router.post("/:examId/start", startAttempt)

router.get("/my", getMyAttempts);

router.get("/:id", getAttemptById);

router.post("/:id/submit", submitAttempt);

module.exports = router;
