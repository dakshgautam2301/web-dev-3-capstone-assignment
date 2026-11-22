
const express = require("express");
const router = express.Router();

const {
    evaluateAttempt,
    getMyResults,
    getAllResults
} = require("../controllers/resultController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.use(protect);

router.post(
    "/evaluate/:id",
    authorizeRoles("admin", "faculty"),
    evaluateAttempt
);

router.get(
    "/my",
    authorizeRoles("student"),
    getMyResults
);

router.get(
    "/",
    authorizeRoles("admin", "faculty"),
    getAllResults
);

module.exports = router;
