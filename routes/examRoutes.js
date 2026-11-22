const express = require("express");
const router = express.Router();

const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam
} = require("../controllers/examController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.use(protect);
router.use(authorizeRoles("admin", "faculty"));

router.post("/", createExam);
router.get("/", getAllExams);
router.get("/:id", validateObjectId, getExamById);
router.put("/:id", validateObjectId, updateExam);
router.delete("/:id", validateObjectId, deleteExam);

module.exports = router;
