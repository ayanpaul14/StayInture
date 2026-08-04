const express = require("express");
const { protect } = require("../middleware/auth");
const {
  startOrContinueConversation,
  getMyConversations,
  sendMessage,
  updateVisitStatus,
} = require("../controllers/conversationController");

const router = express.Router();

router.use(protect); // every conversation route requires login

router.post("/", startOrContinueConversation);
router.get("/", getMyConversations);
router.post("/:id/messages", sendMessage);
router.patch("/:id/visit", updateVisitStatus);

module.exports = router;
