const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getSubjectPerformance
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorizeRoles("admin", "faculty"));

router.get("/stats", getDashboardStats);
router.get("/subject-performance", getSubjectPerformance);

module.exports = router;
