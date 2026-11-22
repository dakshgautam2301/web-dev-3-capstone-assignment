const express = require("express");
const router = express.Router();

const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require("../controllers/questionController");

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { validateObjectId } = require("../middleware/validationMiddleware");

router.use(protect);
router.use(authorizeRoles("admin", "faculty"));

router.post("/", createQuestion);
router.get("/", getAllQuestions);
router.get("/:id", validateObjectId, getQuestionById);
router.put("/:id", validateObjectId, updateQuestion);
router.delete("/:id", validateObjectId, deleteQuestion);

module.exports = router;
